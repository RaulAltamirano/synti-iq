import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/shared/redis/redis.service';
import { HealthRepository } from './health.repository';
import type { HealthCheckResult } from './health-check.types';

export interface HealthEvaluation {
  checks: HealthCheckResult['checks'];
  ok: boolean;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private readonly healthRepository: HealthRepository,
    private readonly redisService: RedisService,
  ) {}

  async evaluate(): Promise<HealthEvaluation> {
    const checks: HealthCheckResult['checks'] = { database: 'down', redis: 'down' };

    const dbUp = await this.healthRepository.ping();
    if (dbUp) {
      checks.database = 'ok';
    } else {
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
    return { checks, ok };
  }
}
