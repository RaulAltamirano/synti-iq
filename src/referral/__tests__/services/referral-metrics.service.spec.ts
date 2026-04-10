import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReferralMetricsService } from '../../services/referral-metrics.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';

describe('ReferralMetricsService', () => {
  let service: ReferralMetricsService;
  let observabilityService: {
    createCounter: jest.Mock;
  };
  let validationCounter: { inc: jest.Mock };
  let codeGenerationCounter: { inc: jest.Mock };
  let usageCounter: { inc: jest.Mock };

  beforeEach(async () => {
    validationCounter = { inc: jest.fn() };
    codeGenerationCounter = { inc: jest.fn() };
    usageCounter = { inc: jest.fn() };

    observabilityService = {
      createCounter: jest.fn(),
    };

    observabilityService.createCounter
      .mockReturnValueOnce(validationCounter)
      .mockReturnValueOnce(codeGenerationCounter)
      .mockReturnValueOnce(usageCounter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralMetricsService,
        { provide: ObservabilityService, useValue: observabilityService },
      ],
    }).compile();

    service = module.get<ReferralMetricsService>(ReferralMetricsService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('creates exactly 3 counters via ObservabilityService.createCounter', () => {
      expect(observabilityService.createCounter).toHaveBeenCalledTimes(3);
    });

    it('creates referral_validations_total with result label', () => {
      expect(observabilityService.createCounter).toHaveBeenCalledWith(
        'referral_validations_total',
        'Total number of referral code validations',
        ['result'],
      );
    });

    it('creates referral_code_generations_total', () => {
      expect(observabilityService.createCounter).toHaveBeenCalledWith(
        'referral_code_generations_total',
        'Total number of referral codes generated',
      );
    });

    it('creates referral_usages_recorded_total', () => {
      expect(observabilityService.createCounter).toHaveBeenCalledWith(
        'referral_usages_recorded_total',
        'Total number of referral usages recorded',
      );
    });
  });

  describe('recordValidation', () => {
    it('increments validation counter with valid result', () => {
      service.recordValidation('valid');
      expect(validationCounter.inc).toHaveBeenCalledWith({ result: 'valid' });
    });

    it('increments validation counter with invalid_format result', () => {
      service.recordValidation('invalid_format');
      expect(validationCounter.inc).toHaveBeenCalledWith({ result: 'invalid_format' });
    });

    it('increments validation counter with not_found result', () => {
      service.recordValidation('not_found');
      expect(validationCounter.inc).toHaveBeenCalledWith({ result: 'not_found' });
    });

    it('increments validation counter with no_profile result', () => {
      service.recordValidation('no_profile');
      expect(validationCounter.inc).toHaveBeenCalledWith({ result: 'no_profile' });
    });
  });

  describe('recordCodeGeneration', () => {
    it('increments code generation counter', () => {
      service.recordCodeGeneration();
      expect(codeGenerationCounter.inc).toHaveBeenCalled();
    });
  });

  describe('recordUsage', () => {
    it('increments usage counter', () => {
      service.recordUsage();
      expect(usageCounter.inc).toHaveBeenCalled();
    });
  });
});
