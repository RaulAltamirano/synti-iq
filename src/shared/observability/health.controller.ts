import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthCheckService } from './health-check.service';
import type { HealthCheckResult } from './health-check.types';

export type { HealthCheckResult } from './health-check.types';

@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  async getHealth(@Res({ passthrough: true }) res: Response): Promise<HealthCheckResult> {
    const { checks, ok } = await this.healthCheckService.evaluate();
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
