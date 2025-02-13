import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { User } from 'src/user/entities/user.entity';

import qrcode from 'qrcode';
import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    authenticator.options = {
      window: [1, 1],
      step: 30,
    };
  }

  async generateSecret(
    user: User,
  ): Promise<{ secret: string; qrCode: string }> {
    const secret = authenticator.generateSecret();
    const appName = this.configService.get<string>('APP_NAME');
    const otpauthUrl = authenticator.keyuri(user.email, appName, secret);

    await this.redisService.set(`2fa:setup:${user.id}`, secret, 300);

    const qrCode = await qrcode.toDataURL(otpauthUrl);

    return { secret, qrCode };
  }

  async verifyAndActivate(user: User, token: string): Promise<boolean> {
    const tempSecret = await this.redisService.get(`2fa:setup:${user.id}`);
    if (!tempSecret) return false;

    const isValid = authenticator.verify({
      token,
      secret: tempSecret.toString(),
    });
    if (isValid) {
      // await user.updateTwoFactorSecret(tempSecret);
      await this.redisService.del(`2fa:setup:${user.id}`);
    }

    return isValid;
  }

  async verify(user: User, token: string): Promise<boolean> {
    return authenticator.verify({ token, secret: user.twoFactorSecret });
  }
}
