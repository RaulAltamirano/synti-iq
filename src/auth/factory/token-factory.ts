import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/shared/jwt-helper/jwt.service';
import { RedisService } from 'src/shared/redis/redis.service';

import { v4 as uuidv4 } from 'uuid';
import { PasswordService } from '../services/password/password.service';
import { TokensUserDto } from '../dto';
import { TokenDto } from 'src/shared/jwt-helper/interfaces/token-dto.interface';

@Injectable()
export class TokenFactory {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly passwordService: PasswordService,
  ) { }

  generateId(): string {
    return uuidv4();
  }

  /**
   * Genera nuevos tokens de acceso y refresh
   * @param userId ID del usuario
   * @param sessionId ID de la sesión
   * @returns Tokens generados
   */
  async generateTokens(
    userId: string,
    sessionId: string,
  ): Promise<TokensUserDto> {
    const token = await this.generateAccessToken(userId, sessionId);
    const refreshToken = await this.generateRefreshToken(userId, sessionId);

    await this.storeRefreshToken(userId, sessionId, refreshToken);

    return { token, refreshToken };
  }

  /**
   * Verifica un refresh token
   * @param token Refresh token a verificar
   * @returns Payload del token
   */
  async verifyRefreshToken(
    token: string,
  ): Promise<{ userId: string; sessionId: string }> {
    try {
      const payload = await this.jwtService.verifyRefreshToken(token);
      const isValid = await this.validateStoredRefreshToken(
        payload.sub,
        payload.sid,
        token,
      );
      if (!isValid) {
        throw new Error('Refresh token not found in storage');
      }

      return { userId: payload.sub, sessionId: payload.sid };
    } catch (error) {
      Logger.error(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Verifica un access token
   * @param token Access token a verificar
   * @returns Payload del token
   */
  verifyAccessToken(token: string): any {
    try {
      return this.jwtService.verifyAccessToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Decodifica un token sin verificar su firma
   * @param token Token a decodificar
   * @returns Payload decodificado
   */
  decodeToken(token: string): any {
    return this.jwtService.decodeToken(token);
  }

  private async generateAccessToken(
    userId: string,
    sessionId: string,
  ): Promise<TokenDto> {
    const payload = {
      sub: userId,
      sid: sessionId,
      jti: uuidv4(),
    };

    return await this.jwtService.generateAccessToken(payload);
  }

  private async generateRefreshToken(
    userId: string,
    sessionId: string,
  ): Promise<TokenDto> {
    const payload = {
      sub: userId,
      sid: sessionId,
      jti: uuidv4(),
    };

    return await this.jwtService.generateRefreshToken(payload);
  }

  private async storeRefreshToken(
    userId: string,
    sessionId: string,
    refreshToken: TokenDto,
  ): Promise<void> {
    const hashedToken = await this.passwordService.hash(refreshToken.token);
    const ttl = this.parseTokenExpiration(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    );

    await this.redisService.set(
      `refresh_token:${userId}:${sessionId}`,
      hashedToken,
      ttl,
    );
  }

  async validateStoredRefreshToken(
    userId: string,
    sessionId: string,
    token: string,
  ): Promise<boolean> {
    const storedToken = await this.redisService.get(
      `refresh_token:${userId}:${sessionId}`,
    );

    if (!storedToken) {
      return false;
    }

    return this.passwordService.verify(token, storedToken.toString(), token);
  }

  private parseTokenExpiration(expiresIn: string): number {
    const value = parseInt(expiresIn.slice(0, -1));
    const unit = expiresIn.slice(-1);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        throw new Error(`Invalid expiration format: ${expiresIn}`);
    }
  }
}
