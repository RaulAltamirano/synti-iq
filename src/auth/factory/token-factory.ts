import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from 'src/shared/jwt-helper/jwt.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { PasswordService } from '../services/password/password.service';
import { TokensUserDto } from '../dto';
import { TokenDto } from 'src/shared/jwt-helper/interfaces/token-dto.interface';

@Injectable()
export class TokenFactory {
  private readonly logger = new Logger(TokenFactory.name);
  private readonly SESSION_TTL = 7 * 24 * 60 * 60;
  private readonly MAX_STORED_USED_TOKENS = 10;

  constructor(
    private readonly jwtService: JwtService,
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
        await this.handleTokenReuse(payload.sub, payload.sid);
        throw new Error('Refresh token already used or invalid');
      }

      return { userId: payload.sub, sessionId: payload.sid };
    } catch (error) {
      this.logger.error(`Refresh token verification failed: ${error.message}`);
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
    const sessionKey = `session:${userId}:${sessionId}`;
    const sessionData = await this.redisService.get<{
      refreshTokenHash?: string;
      isValid?: boolean;
      usedTokens?: string[];
    }>(sessionKey);

    if (!sessionData || !sessionData.refreshTokenHash) {
      this.logger.warn(`No session data found for user ${userId}, session ${sessionId}`);
      return false;
    }

    if (sessionData.isValid === false) {
      this.logger.warn(`Session invalidated for user ${userId}, session ${sessionId}`);
      return false;
    }

    const isCurrentToken = await this.passwordService.compare(token, sessionData.refreshTokenHash);
    if (isCurrentToken) {
      return true;
    }

    if (sessionData.usedTokens && sessionData.usedTokens.length > 0) {
      for (const usedTokenHash of sessionData.usedTokens) {
        const isUsedToken = await this.passwordService.compare(token, usedTokenHash);
        if (isUsedToken) {
          this.logger.warn(`Token reuse detected for user ${userId}, session ${sessionId}`);
          return false;
        }
      }
    }

    return false;
  }

  async invalidateRefreshToken(userId: string, sessionId: string, token: string): Promise<void> {
    const sessionKey = `session:${userId}:${sessionId}`;
    const sessionData = await this.redisService.get<{
      refreshTokenHash: string;
      isValid: boolean;
      usedTokens?: string[];
      lastUsed?: string;
      deviceInfo?: any;
    }>(sessionKey);

    if (!sessionData) {
      this.logger.warn(
        `Cannot invalidate token: session not found for user ${userId}, session ${sessionId}`,
      );
      return;
    }

    const tokenHash = await this.passwordService.hash(token);
    const usedTokens = sessionData.usedTokens || [];
    usedTokens.push(tokenHash);

    if (usedTokens.length > this.MAX_STORED_USED_TOKENS) {
      usedTokens.shift();
    }

    await this.redisService.set(
      sessionKey,
      {
        ...sessionData,
        usedTokens,
      },
      this.SESSION_TTL,
    );
  }

  private async handleTokenReuse(userId: string, sessionId: string): Promise<void> {
    this.logger.warn(
      `Security alert: Token reuse detected for user ${userId}, session ${sessionId}`,
    );
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
