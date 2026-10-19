import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import { createHash, randomInt } from 'node:crypto';
import { Repository } from 'typeorm';
import { toDataURL } from 'qrcode';

import { User } from 'src/user/entities/user.entity';
import { UserBackupCode } from 'src/auth/entities/user-backup-code.entity';
import { RedisService } from 'src/shared/redis/redis.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import {
  AUTH_2FA_SPAN_NAMES,
  AUTH_2FA_SPAN_ATTRIBUTES,
} from 'src/auth/constants/auth-span.constants';

const BACKUP_CODES_COUNT = 8;
const BACKUP_CODE_LENGTH = 4; // XXXX-XXXX-XXXX = 4+4+4

export interface VerifyAndActivateResult {
  success: boolean;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  method: 'authenticator' | null;
  backupCodesRemaining: number;
}

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly observabilityService: ObservabilityService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserBackupCode)
    private readonly backupCodeRepository: Repository<UserBackupCode>,
  ) {
    authenticator.options = {
      window: [1, 1],
      step: 30,
    };
  }

  async generateSecret(user: User): Promise<{ secret: string; qrCode: string }> {
    return this.observabilityService.withSpan(AUTH_2FA_SPAN_NAMES.GENERATE_SECRET, async span => {
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.USER_ID, user.id);
      const secret = authenticator.generateSecret();
      const appName = this.configService.get<string>('APP_NAME') ?? 'SyntiIQ';
      const otpauthUrl = authenticator.keyuri(user.email, appName, secret);

      await this.redisService.set(`2fa:setup:${user.id}`, secret, 300);

      const qrCode = await toDataURL(otpauthUrl);

      return { secret, qrCode };
    });
  }

  async verifyAndActivate(user: User, token: string): Promise<VerifyAndActivateResult> {
    return this.observabilityService.withSpan(AUTH_2FA_SPAN_NAMES.VERIFY_ACTIVATE, async span => {
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.USER_ID, user.id);
      const tempSecret = await this.redisService.get(`2fa:setup:${user.id}`);
      if (!tempSecret) {
        throw new BadRequestException(
          '2FA setup expired or not started. Please start setup again.',
        );
      }

      const isValid = authenticator.verify({
        token,
        secret: tempSecret.toString(),
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid TOTP code');
      }

      await this.redisService.del(`2fa:setup:${user.id}`);

      await this.userRepository.update(user.id, {
        twoFactorSecret: tempSecret.toString(),
      });

      const backupCodes = await this.generateAndStoreBackupCodes(user.id);
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.BACKUP_CODES_REMAINING, backupCodes.length);

      return { success: true, backupCodes };
    });
  }

  async verify(user: User, token: string): Promise<boolean> {
    return this.observabilityService.withSpan(AUTH_2FA_SPAN_NAMES.VERIFY, async span => {
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.USER_ID, user.id);
      if (!user.twoFactorSecret) {
        span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.ENABLED, false);
        return false;
      }
      const result = authenticator.verify({ token, secret: user.twoFactorSecret });
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.ENABLED, true);
      return result;
    });
  }

  async disable(userId: string, code: string): Promise<void> {
    return this.observabilityService.withSpan(AUTH_2FA_SPAN_NAMES.DISABLE, async span => {
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.USER_ID, userId);
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'twoFactorSecret'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.twoFactorSecret) {
        throw new BadRequestException('2FA is not enabled');
      }

      const isValidTotp = authenticator.verify({
        token: code,
        secret: user.twoFactorSecret,
      });

      if (isValidTotp) {
        await this.userRepository.update(userId, { twoFactorSecret: null });
        await this.backupCodeRepository.delete({ userId });
        return;
      }

      const isValidBackup = await this.verifyBackupCodeInternal(userId, code);
      if (isValidBackup) {
        await this.userRepository.update(userId, { twoFactorSecret: null });
        await this.backupCodeRepository.delete({ userId });
        return;
      }

      throw new UnauthorizedException('Invalid TOTP or backup code');
    });
  }

  async getStatus(user: User): Promise<TwoFactorStatus> {
    return this.observabilityService.withSpan(AUTH_2FA_SPAN_NAMES.GET_STATUS, async span => {
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.USER_ID, user.id);
      const userWithSecret = await this.userRepository.findOne({
        where: { id: user.id },
        select: ['id', 'twoFactorSecret'],
      });

      const enabled = !!userWithSecret?.twoFactorSecret;
      span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.ENABLED, enabled);

      let backupCodesRemaining = 0;
      if (enabled) {
        backupCodesRemaining = await this.backupCodeRepository.count({
          where: { userId: user.id, usedAt: null },
        });
        span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.BACKUP_CODES_REMAINING, backupCodesRemaining);
      }

      return {
        enabled,
        method: enabled ? 'authenticator' : null,
        backupCodesRemaining,
      };
    });
  }

  async generateAndStoreBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    const entities: UserBackupCode[] = [];

    for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
      const code = this.generateBackupCode();
      codes.push(code);
      const codeHash = this.hashBackupCode(code);
      entities.push(
        this.backupCodeRepository.create({
          userId,
          codeHash,
          usedAt: null,
        }),
      );
    }

    await this.backupCodeRepository.save(entities);
    return codes;
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    await this.backupCodeRepository.delete({ userId });
    return this.generateAndStoreBackupCodes(userId);
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    return this.observabilityService.withSpan(
      AUTH_2FA_SPAN_NAMES.VERIFY_BACKUP_CODE,
      async span => {
        span.setAttribute(AUTH_2FA_SPAN_ATTRIBUTES.USER_ID, userId);
        return this.verifyBackupCodeInternal(userId, code);
      },
    );
  }

  private async verifyBackupCodeInternal(userId: string, code: string): Promise<boolean> {
    const codeHash = this.hashBackupCode(code);
    const backupCode = await this.backupCodeRepository.findOne({
      where: { userId, codeHash, usedAt: null },
    });

    if (!backupCode) return false;

    await this.backupCodeRepository.update(backupCode.id, {
      usedAt: new Date(),
    });
    return true;
  }

  private generateBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part = (): string =>
      Array.from({ length: BACKUP_CODE_LENGTH }, () => chars[randomInt(chars.length)]).join('');
    return `${part()}-${part()}-${part()}`;
  }

  private hashBackupCode(code: string): string {
    return createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
  }
}
