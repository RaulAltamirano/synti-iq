import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter } from 'prom-client';
import { ObservabilityService } from 'src/shared/observability/observability.service';

@Injectable()
export class TemplateMetricsService implements OnModuleInit {
  private createCounter: Counter;
  private listCounter: Counter;
  private updateCounter: Counter;
  private deleteCounter: Counter;

  constructor(private readonly observabilityService: ObservabilityService) {}

  onModuleInit(): void {
    this.createCounter = this.observabilityService.createCounter(
      'template_items_created_total',
      'Total number of template items created',
    );

    this.listCounter = this.observabilityService.createCounter(
      'template_items_list_total',
      'Total number of items returned across list operations, by status label. Incremented by count per list call, not by operation count.',
      ['status'],
    );

    this.updateCounter = this.observabilityService.createCounter(
      'template_items_updated_total',
      'Total number of template items updated',
    );

    this.deleteCounter = this.observabilityService.createCounter(
      'template_items_deleted_total',
      'Total number of template items deleted',
    );
  }

  /** Increments the create counter by 1 per created item. */
  recordCreate(): void {
    this.createCounter.inc();
  }

  /**
   * Records list operation metrics: increments by count (items returned) with status label.
   * Semantic: total items returned, not number of list operations.
   * @param count - Number of items returned in the list response
   * @param status - Filter status used ('active' | 'inactive') or 'all' when no filter
   */
  recordList(count: number, status?: string): void {
    this.listCounter.inc({ status: status ?? 'all' }, count);
  }

  /** Increments the update counter by 1 per updated item. */
  recordUpdate(): void {
    this.updateCounter.inc();
  }

  /** Increments the delete counter by 1 per deleted item. */
  recordDelete(): void {
    this.deleteCounter.inc();
  }
}
