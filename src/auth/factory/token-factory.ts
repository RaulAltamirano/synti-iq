import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/shared/jwt-helper/jwt.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { PasswordService } from '../services/password/password.service';
import { TokensUserDto } from '../dto';
import { TokenDto } from 'src/shared/jwt-helper/interfaces/token-dto.interface';

@Injectable()
export class TokenFactory {
  private readonly logger = new Logger(TokenFactory.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly passwordService: PasswordService,
  ) {}

  generateId(): string {
    return uuidv4();
  }

  async generateTokens(
    userId: string,
    sessionId: string,
  ): Promise<{ tokens: TokensUserDto; refreshTokenHash: string }> {
    const token = await this.generateAccessToken(userId, sessionId);
    const refreshToken = await this.generateRefreshToken(userId, sessionId);
    const refreshTokenHash = await this.passwordService.hash(refreshToken.token);

    return { tokens: { token, refreshToken }, refreshTokenHash };
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string; sessionId: string }> {
    try {
      const payload = await this.jwtService.verifyRefreshToken(token);
      const isValid = await this.validateStoredRefreshToken(payload.sub, payload.sid, token);
      if (!isValid) {
        throw new Error('Refresh token not found in storage');
      }

      return { userId: payload.sub, sessionId: payload.sid };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  verifyAccessToken(token: string): any {
    try {
      return this.jwtService.verifyAccessToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decodeToken(token);
  }

  private async generateAccessToken(userId: string, sessionId: string): Promise<TokenDto> {
    const payload = {
      sub: userId,
      sid: sessionId,
      jti: uuidv4(),
    };

    return await this.jwtService.generateAccessToken(payload);
  }

  private async generateRefreshToken(userId: string, sessionId: string): Promise<TokenDto> {
    const payload = {
      sub: userId,
      sid: sessionId,
      jti: uuidv4(),
    };

    return await this.jwtService.generateRefreshToken(payload);
  }

  async validateStoredRefreshToken(
    userId: string,
    sessionId: string,
    token: string,
  ): Promise<boolean> {
    const sessionData = await this.redisService.get<{
      refreshTokenHash?: string;
      isValid?: boolean;
    }>(`session:${userId}:${sessionId}`);

    if (!sessionData || !sessionData.refreshTokenHash) {
      return false;
    }

    if (sessionData.isValid === false) {
      return false;
    }

    return this.passwordService.compare(token, sessionData.refreshTokenHash);
  }

  async deleteRefreshToken(userId: string, sessionId: string): Promise<void> {
    try {
      const sessionKey = `session:${userId}:${sessionId}`;
      await this.redisService.del(sessionKey);
    } catch (error) {
      this.logger.error(`Error deleting session/refresh token: ${error.message}`, error.stack);
    }
  }
}
