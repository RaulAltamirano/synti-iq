import { Controller, Get, Header } from '@nestjs/common';
import { ObservabilityService } from './observability.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.observabilityService.getMetrics();
  }
}
