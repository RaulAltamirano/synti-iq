import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservabilityService } from './observability.service';
import { MetricsController } from './metrics.controller';
import { HealthController } from './health.controller';
import { MetricsAuthGuard } from './metrics-auth.guard';
import { RedisModule } from 'src/shared/redis/redis.module';
import { HealthRepository } from './health.repository';
import { HealthCheckService } from './health-check.service';

@Global()
@Module({
  imports: [TypeOrmModule, RedisModule],
  controllers: [MetricsController, HealthController],
  providers: [ObservabilityService, MetricsAuthGuard, HealthRepository, HealthCheckService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
