import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { TokenDto } from '../interfaces/token-dto.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtTokenStrategy {
  async generate(payload: JwtPayload, secret: string, expiresIn: string): Promise<TokenDto> {
    const token = jwt.sign(payload, secret, {
      expiresIn,
      algorithm: 'HS256',
    });

    return {
      token,
      expiresIn,
    };
  }

  async verify(token: string, secret: string): Promise<JwtPayload> {
    return jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
  }

  decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
