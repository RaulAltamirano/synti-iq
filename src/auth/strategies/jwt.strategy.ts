import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'src/shared/jwt-helper/interfaces/jwt-payload.interface';
import { AuthService } from '../auth.service';
import { TokenFormatValidator } from './token-format.validator';
import { TokenExtractorChain } from './token-extractor-chain';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly tokenValidator: TokenFormatValidator,
    private readonly tokenExtractorChain: TokenExtractorChain,
  ) {
    const publicKey = JwtStrategy.loadPublicKey(configService);
    super({
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      jwtFromRequest: req => tokenExtractorChain.extract(req),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  private static loadPublicKey(configService: ConfigService): string {
    const keyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH');
    const keyContent = configService.get<string>('JWT_PUBLIC_KEY');

    if (keyContent) {
      return keyContent.replace(/\\n/g, '\n');
    }

    if (keyPath) {
      const fullPath = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Public key file not found: ${fullPath}`);
      }

      return fs.readFileSync(fullPath, 'utf8');
    }

    throw new Error('JWT_PUBLIC_KEY_PATH or JWT_PUBLIC_KEY must be configured');
  }

  async validate(req: Request, payload: JwtPayload): Promise<unknown> {
    try {
      if (!payload.sub) {
        this.logger.error('Token missing user ID (sub)');
        throw new Error('Invalid token: missing user ID');
      }

      if (!payload.sid) {
        this.logger.error('Token missing session ID (sid)');
        throw new Error('Invalid token: missing session ID');
      }

      await this.tokenValidator.validate(payload);

      const user = await this.authService.validateUserAndSession(payload.sub, payload.sid);

      if (!user) {
        this.logger.error(`User validation returned null for user: ${payload.sub}`);
        throw new Error('User validation failed');
      }

      req.user = {
        ...user,
        sub: payload.sub,
        sid: payload.sid,
        jti: payload.jti,
      };

      return req.user;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`, error.stack, {
        userId: payload?.sub,
        sessionId: payload?.sid,
      });
      throw error;
    }
  }
}
