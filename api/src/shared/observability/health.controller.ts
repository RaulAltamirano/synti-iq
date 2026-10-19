import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { observabilityEndpoints } from 'src/docs/observability.endpoints';
import { ApiDoc } from 'src/shared/decorators/api-doc.decorator';
import { HealthCheckService } from './health-check.service';
import type { HealthCheckResult } from './health-check.types';

export type { HealthCheckResult } from './health-check.types';

@ApiTags('Observability')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiDoc(observabilityEndpoints, 'getHealth')
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
