import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { readMetricsKeyFromRequest } from './metrics-request.util';

function isLoopbackAddress(address: string | undefined): boolean {
  if (!address) {
    return false;
  }
  const normalized = address.replace(/^::ffff:/i, '');
  return normalized === '127.0.0.1' || normalized === '::1';
}

@Injectable()
export class MetricsAuthGuard implements CanActivate {
  private readonly logger = new Logger(MetricsAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const configuredKey = this.configService.get<string>('METRICS_API_KEY')?.trim();

    if (configuredKey) {
      if (readMetricsKeyFromRequest(req) === configuredKey) {
        return true;
      }
      throw new ForbiddenException('Metrics access denied');
    }

    const nodeEnv =
      this.configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV ?? 'development';
    if (nodeEnv === 'development') {
      if (isLoopbackAddress(req.socket?.remoteAddress)) {
        return true;
      }
      throw new ForbiddenException('Metrics access denied');
    }

    this.logger.warn('METRICS_API_KEY is not set in non-development; refusing /metrics scrape');
    throw new ForbiddenException('Metrics access denied');
  }
}
