import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import { MetricsAuthGuard } from './metrics-auth.guard';
import { SkipResponseInterceptor } from 'src/shared/interceptors/skip-response-interceptor.decorator';

@Controller('metrics')
@UseGuards(MetricsAuthGuard)
export class MetricsController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @SkipResponseInterceptor()
  async getMetrics(): Promise<string> {
    return this.observabilityService.getMetrics();
  }
}
