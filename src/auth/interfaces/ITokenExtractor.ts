import { Request } from 'express';

export interface ITokenExtractor {
  extract(req: Request): string | null;
}
