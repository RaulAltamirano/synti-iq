import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter } from 'prom-client';
import { ObservabilityService } from 'src/shared/observability/observability.service';

export type ReferralValidationResult = 'valid' | 'invalid_format' | 'not_found' | 'no_profile';

@Injectable()
export class ReferralMetricsService implements OnModuleInit {
  private validationCounter: Counter<string>;
  private codeGenerationCounter: Counter<string>;
  private usageCounter: Counter<string>;

  constructor(private readonly observabilityService: ObservabilityService) {}

  onModuleInit() {
    this.validationCounter = this.observabilityService.createCounter(
      'referral_validations_total',
      'Total number of referral code validations',
      ['result'],
    );

    this.codeGenerationCounter = this.observabilityService.createCounter(
      'referral_code_generations_total',
      'Total number of referral codes generated',
    );

    this.usageCounter = this.observabilityService.createCounter(
      'referral_usages_recorded_total',
      'Total number of referral usages recorded',
    );
  }

  recordValidation(result: ReferralValidationResult): void {
    this.validationCounter.inc({ result });
  }

  recordCodeGeneration(): void {
    this.codeGenerationCounter.inc();
  }

  recordUsage(): void {
    this.usageCounter.inc();
  }
}
