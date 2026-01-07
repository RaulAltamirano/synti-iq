import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    requestContext.run({ requestId }, () => {
      res.setHeader('X-Request-ID', requestId);
      next();
    });
  }
}

export function getRequestId(): string | undefined {
  const store = requestContext.getStore();
  return store?.requestId;
}
