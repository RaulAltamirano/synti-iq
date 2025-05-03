import { Injectable } from '@nestjs/common';
import { ITokenExtractor } from '../interfaces/ITokenExtractor';
import { Request } from 'express';

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
