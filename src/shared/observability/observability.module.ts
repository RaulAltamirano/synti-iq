import { Module, Global } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import { MetricsController } from './metrics.controller';
import { HealthController } from './health.controller';

@Global()
@Module({
  controllers: [MetricsController, HealthController],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
