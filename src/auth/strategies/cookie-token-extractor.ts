import { Injectable } from '@nestjs/common';
import { ITokenExtractor } from '../interfaces/ITokenExtractor';
import { Request } from 'express';

@Injectable()
export class CookieTokenExtractor implements ITokenExtractor {
  /**
   * Extracts JWT from cookies
   *
   * @param req - Express request object
   * @returns The JWT token or null if not found
   */
  extract(req: Request): string | null {
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    }
    return null;
  }
}
