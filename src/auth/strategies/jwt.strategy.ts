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
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly tokenValidator: TokenFormatValidator,
    private readonly tokenExtractorChain: TokenExtractorChain,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      jwtFromRequest: (req) => tokenExtractorChain.extract(req),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  /**
   * Validates the JWT payload and authenticates the user
   *
   * @param req - Express request object
   * @param payload - The decoded JWT payload
   * @returns The authenticated user object
   * @throws UnauthorizedException when validation fails
   */
  async validate(req: Request, payload: JwtPayload): Promise<any> {
    try {
      this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
      
      // Validate token format
      await this.tokenValidator.validate(payload);
      this.logger.debug('Token format validation passed');
      
      // Validate user and session
      const user = await this.authService.validateUserAndSession(
        payload.sub,
        payload.sid,
        payload.jti,
      );
      this.logger.debug(`User validation successful: ${JSON.stringify(user)}`);

      // Attach both user and payload to the request
      req.user = {
        ...user,
        sub: payload.sub,
        sid: payload.sid,
        jti: payload.jti
      };

      return req.user;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`, error.stack);
      this.logger.error(`Failed payload: ${JSON.stringify(payload)}`);
      throw error;
    }
  }
}
