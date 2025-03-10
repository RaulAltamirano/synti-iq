import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  private readonly SALT_ROUNDS = process.env.SALT_ROUNDS
    ? parseInt(process.env.SALT_ROUNDS)
    : 12;
  private PASSWORD_PEPPER = process.env.PASSWORD_PEPPER || 'default_pepper';
  private readonly RECOVERY_TOKEN_LENGTH = 32;
  private readonly RECOVERY_TOKEN_EXPIRY = 3600;
  private readonly TOKEN_PREFIX = 'pwReset:';

  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 900;

  constructor(private readonly redisService: RedisService) {}

  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required for hashing');
    }
    const pepperedPassword = `${password}${this.PASSWORD_PEPPER}`;
    try {
      const hashedResult = await bcrypt.hash(
        pepperedPassword,
        this.SALT_ROUNDS,
      );
      return hashedResult;
    } catch (error) {
      this.logger.error('Error hashing password', error);
      throw new InternalServerErrorException('Error processing password');
    }
  }

  async verify(
    plainPassword: string,
    hashedPassword: string,
    email: string,
  ): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      this.logger.error('Missing password arguments for verification');
      throw new BadRequestException('Password and hash are required');
    }

    const attemptsKey = `loginAttempts:${email}`;
    const lockoutKey = `lockout:${email}`;

    if (await this.redisService.get(lockoutKey)) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    try {
      const pepperedPassword = `${plainPassword}${this.PASSWORD_PEPPER}`;
      const isMatch = await bcrypt.compare(pepperedPassword, hashedPassword);

      if (!isMatch) {
        const attempts = await this.redisService.incr(attemptsKey);
        const lockoutDuration = Math.min(2 ** attempts, 900);

        if (attempts >= this.MAX_ATTEMPTS) {
          await this.redisService.set(
            lockoutKey,
            'locked',
            this.LOCKOUT_DURATION,
          );
          throw new UnauthorizedException(
            `Too many failed attempts. Locked for ${lockoutDuration / 60} min.`,
          );
        }
      } else {
        await this.redisService.del(attemptsKey);
      }

      return isMatch;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error verifying password', error);
      throw new InternalServerErrorException('Error verifying password');
    }
  }
  async compareHash(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
