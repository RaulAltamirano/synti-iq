import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenOptions } from './interfaces/token-options.interface';
import {
  DEFAULT_ACCESS_EXPIRES_IN,
  DEFAULT_REFRESH_EXPIRES_IN,
  DEFAULT_ALGORITHM,
} from './constants/jwt.constants';
import { JwtTokenStrategy } from './strategies/token-strategy';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenDto } from './interfaces/token-dto.interface';

@Injectable()
export class JwtService {
  private readonly options: TokenOptions;
  private readonly logger = new Logger(JwtService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtStrategy: JwtTokenStrategy,
  ) {
    this.options = this.validateConfig();
  }

  async generateAccessToken(payload: JwtPayload): Promise<TokenDto> {
    return this.jwtStrategy.generate(
      payload,
      this.options.accessSecret,
      this.options.accessExpiresIn,
    );
  }

  async generateRefreshToken(payload: JwtPayload): Promise<TokenDto> {
    return this.jwtStrategy.generate(
      payload,
      this.options.refreshSecret,
      this.options.refreshExpiresIn,
    );
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.verifyToken(token, this.options.accessSecret);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.verifyToken(token, this.options.refreshSecret);
  }

  decodeToken(token: string): JwtPayload | null {
    return this.jwtStrategy.decode(token);
  }

  private async verifyToken(token: string, secret: string): Promise<JwtPayload> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    try {
      return await this.jwtStrategy.verify(token, secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired', 'token_expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(`Invalid token: ${error.message}`, 'invalid_token');
      }

      this.logger.error('Token verification error', {
        error: error.message,
        name: error.name,
      });
      throw new UnauthorizedException(`Invalid token: ${error.message}`, 'invalid_token');
    }
  }

  private validateConfig(): TokenOptions {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets must be configured');
    }

    return {
      accessSecret,
      refreshSecret,
      accessExpiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME') || DEFAULT_ACCESS_EXPIRES_IN,
      refreshExpiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || DEFAULT_REFRESH_EXPIRES_IN,
      algorithm: DEFAULT_ALGORITHM,
    };
  }
}
