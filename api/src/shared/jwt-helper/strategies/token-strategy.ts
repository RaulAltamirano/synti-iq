import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { TokenDto } from '../interfaces/token-dto.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtTokenStrategy {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly algorithm = 'RS256';

  constructor(private readonly configService: ConfigService) {
    this.privateKey = this.loadKey('private');
    this.publicKey = this.loadKey('public');
  }

  private loadKey(keyType: 'private' | 'public'): string {
    const keyTypeUpper = keyType.toUpperCase();
    const keyPath = this.configService.get<string>(`JWT_${keyTypeUpper}_KEY_PATH`);
    const keyContent = this.configService.get<string>(`JWT_${keyTypeUpper}_KEY`);

    if (keyContent) {
      return keyContent.replace(/\\n/g, '\n');
    }

    if (keyPath) {
      const fullPath = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`${keyTypeUpper} key file not found: ${fullPath}`);
      }

      return fs.readFileSync(fullPath, 'utf8');
    }

    throw new Error(`JWT_${keyTypeUpper}_KEY_PATH or JWT_${keyTypeUpper}_KEY must be configured`);
  }

  async generate(payload: JwtPayload, expiresIn: string): Promise<TokenDto> {
    const token = jwt.sign(payload, this.privateKey, {
      expiresIn,
      algorithm: this.algorithm,
    });

    return {
      token,
      expiresIn,
    };
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm],
        complete: true,
      }) as jwt.JwtPayload & { header: { alg: string; typ?: string } };

      if (decoded.header.alg !== this.algorithm) {
        throw new Error(`Invalid algorithm: expected ${this.algorithm}, got ${decoded.header.alg}`);
      }

      if (decoded.header.typ && decoded.header.typ !== 'JWT') {
        throw new Error(`Invalid token type: ${decoded.header.typ}`);
      }

      return decoded.payload as JwtPayload;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error(`Token verification failed: ${error.message}`);
      }
      throw error;
    }
  }

  decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
