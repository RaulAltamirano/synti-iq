import { Controller, Get, HttpStatus, Logger, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { Response } from 'express';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  checks: {
    database: 'ok' | 'down';
    redis: 'ok' | 'down';
  };
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async getHealth(@Res({ passthrough: true }) res: Response): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = { database: 'down', redis: 'down' };

    try {
      await this.dataSource.query('SELECT 1');
      checks.database = 'ok';
    } catch {
      this.logger.warn('Health check: database unreachable');
    }

    try {
      const pong = await this.redisService.getClient().ping();
      if (pong === 'PONG') {
        checks.redis = 'ok';
      }
    } catch {
      this.logger.warn('Health check: redis unreachable');
    }

    const ok = checks.database === 'ok' && checks.redis === 'ok';
    if (!ok) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: ok ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
