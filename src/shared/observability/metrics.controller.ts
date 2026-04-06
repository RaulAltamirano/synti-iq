import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { observabilityEndpoints } from 'src/docs/observability.endpoints';
import { ApiDoc } from 'src/shared/decorators/api-doc.decorator';
import { SkipResponseInterceptor } from 'src/shared/interceptors/skip-response-interceptor.decorator';
import { MetricsAuthGuard } from './metrics-auth.guard';
import { ObservabilityService } from './observability.service';

@ApiTags('Observability')
@Controller('metrics')
@UseGuards(MetricsAuthGuard)
export class MetricsController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get()
  @ApiDoc(observabilityEndpoints, 'getMetrics')
  @ApiProduces('text/plain')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @SkipResponseInterceptor()
  async getMetrics(): Promise<string> {
    return this.observabilityService.getMetrics();
  }
}
