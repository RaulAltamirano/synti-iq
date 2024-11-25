import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtHelperService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    this.accessExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRATION_TIME',
    );
    this.refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION_TIME',
    );
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
      algorithm: 'HS256',
    });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      algorithm: 'HS256',
    });
  }

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.accessSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid access token', error);
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token', error);
    }
  }
}
