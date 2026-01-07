import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'src/shared/jwt-helper/interfaces/jwt-payload.interface';
import { AuthService } from '../auth.service';
import { TokenFormatValidator } from './token-format.validator';
import { TokenExtractorChain } from './token-extractor-chain';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly tokenValidator: TokenFormatValidator,
    private readonly tokenExtractorChain: TokenExtractorChain,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      jwtFromRequest: req => tokenExtractorChain.extract(req),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<any> {
    try {
      this.logger.debug(`Validating token for user: ${payload.sub}, session: ${payload.sid}`);

      if (!payload.sub) {
        this.logger.error('Token missing user ID (sub)');
        throw new Error('Invalid token: missing user ID');
      }

      if (!payload.sid) {
        this.logger.error('Token missing session ID (sid)');
        throw new Error('Invalid token: missing session ID');
      }

      await this.tokenValidator.validate(payload);

      const user = await this.authService.validateUserAndSession(
        payload.sub,
        payload.sid,
        payload.jti,
      );

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

      this.logger.debug(`Token validated successfully for user: ${payload.sub}`);
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
