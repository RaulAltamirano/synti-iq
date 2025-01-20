import { Repository } from 'typeorm';
import { Request as RequestType } from 'express';

import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { User } from '../../user/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

import { validate as isUUID } from 'uuid';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
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
    const { id } = jwtPayload;
    if (!isUUID(id))
      return done(new UnauthorizedException('Invalid token'), false);
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        select: { id: true, refreshToken: true, isActive: true },
      });
      console.log();
      if (!user) return done(new UnauthorizedException('Invalid token'), false);
      if (!user.isActive)
        return done(
          new ForbiddenException('User is inactive, talk with admin'),
          false,
        );
      if (!user.refreshToken)
        return done(new ForbiddenException('Login to continue'), false);

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    }
    return null;
  }
}
