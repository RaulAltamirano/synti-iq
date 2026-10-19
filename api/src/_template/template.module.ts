import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateItem } from './entities/template-item.entity';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TemplateMetricsService } from './services/template-metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateItem])],
  controllers: [TemplateController],
  providers: [TemplateService, TemplateMetricsService],
  exports: [TemplateService],
})
export class TemplateModule {}
