import { Repository } from 'typeorm';
import { Request as RequestType } from 'express';

import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { User } from '../../user/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

import { validate as isUUID } from 'uuid';
import { UserSessionService } from 'src/user-session/user-session.service';
import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly userSessionService: UserSessionService,
    private readonly redisService: RedisService,
  ) {
    super({
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }

  async validate(
    jwtPayload: JwtPayload,
    done: VerifiedCallback,
  ): Promise<void> {
    try {
      const { sub: userId, sid: sessionId, jti } = jwtPayload;

      // Validación de UUID
      if (!isUUID(userId)) {
        return done(new UnauthorizedException('Invalid token format'), false);
      }

      // Extracción con manejo de errores
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: { id: true, isActive: true, email: true },
      });

      if (!user) {
        return done(new UnauthorizedException('User not found'), false);
      }

      if (!user.isActive) {
        return done(
          new ForbiddenException('User is inactive, contact admin'),
          false,
        );
      }

      // Validación de sesión
      const session = await this.userSessionService.findSessionById(
        userId,
        sessionId,
      );
      if (!session) {
        return done(new UnauthorizedException('Session not found'), false);
      }

      if (!session.isValid) {
        return done(new UnauthorizedException('Session is invalid'), false);
      }

      const tokenKey = `accessToken:${userId}:${sessionId}:${jti}`;
      const isValidToken = await this.redisService.exists(tokenKey);

      if (!isValidToken) {
        return done(
          new UnauthorizedException('Token expired or revoked'),
          false,
        );
      }

      await this.userSessionService.updateSessionLastUsed(userId, sessionId);
      done(null, user);
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`, error.stack);
      return done(
        new InternalServerErrorException('Authentication error'),
        false,
      );
    }
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    }
    return null;
  }
}
