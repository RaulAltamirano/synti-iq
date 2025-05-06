import { Injectable } from '@nestjs/common';
import { ITokenExtractor } from '../interfaces/ITokenExtractor';
import { Request } from 'express';

@Injectable()
export class BearerTokenExtractor implements ITokenExtractor {
  /**
   * Extracts JWT from Authorization header
   *
   * @param req - Express request object
   * @returns The JWT token or null if not found
   */
  extract(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

// Chain of Responsibility pattern for token extraction
@Injectable()
export class TokenExtractorChain implements ITokenExtractor {
  constructor(private readonly extractors: ITokenExtractor[]) {}

  /**
   * Extracts JWT using a chain of extractors
   *
   * @param req - Express request object
   * @returns The JWT token or null if not found
   */
  extract(req: Request): string | null {
    for (const extractor of this.extractors) {
      const token = extractor.extract(req);
      if (token) {
        return token;
      }
    }
    return null;
  }
}
