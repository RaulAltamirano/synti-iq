import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter } from 'prom-client';
import { ObservabilityService } from 'src/shared/observability/observability.service';

@Injectable()
export class TemplateMetricsService implements OnModuleInit {
  private createCounter: Counter;
  private listCounter: Counter;

  constructor(private readonly observabilityService: ObservabilityService) {}

  onModuleInit(): void {
    this.createCounter = this.observabilityService.createCounter(
      'template_items_created_total',
      'Total number of template items created',
    );

    this.listCounter = this.observabilityService.createCounter(
      'template_items_list_total',
      'Total number of template item list operations',
      ['status'],
    );
  }

  recordCreate(): void {
    this.createCounter.inc();
  }

  recordList(count: number, status?: string): void {
    this.listCounter.inc({ status: status ?? 'all' }, count);
  }
}
