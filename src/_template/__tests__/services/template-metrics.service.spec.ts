import { Test, TestingModule } from '@nestjs/testing';
import { TemplateMetricsService } from '../../services/template-metrics.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';

describe('TemplateMetricsService', () => {
  let service: TemplateMetricsService;
  let observabilityService: {
    createCounter: jest.Mock;
  };
  let createCounter: { inc: jest.Mock };
  let listCounter: { inc: jest.Mock };

  beforeEach(async () => {
    createCounter = { inc: jest.fn() };
    listCounter = { inc: jest.fn() };

    observabilityService = {
      createCounter: jest.fn(),
    };

    observabilityService.createCounter
      .mockReturnValueOnce(createCounter)
      .mockReturnValueOnce(listCounter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateMetricsService,
        { provide: ObservabilityService, useValue: observabilityService },
      ],
    }).compile();

    service = module.get<TemplateMetricsService>(TemplateMetricsService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('creates exactly 2 counters via ObservabilityService.createCounter', () => {
      expect(observabilityService.createCounter).toHaveBeenCalledTimes(2);
    });

    it('creates template_items_created_total', () => {
      expect(observabilityService.createCounter).toHaveBeenCalledWith(
        'template_items_created_total',
        'Total number of template items created',
      );
    });

    it('creates template_items_list_total with status label', () => {
      expect(observabilityService.createCounter).toHaveBeenCalledWith(
        'template_items_list_total',
        'Total number of template item list operations',
        ['status'],
      );
    });
  });

  describe('recordCreate', () => {
    it('increments create counter', () => {
      service.recordCreate();
      expect(createCounter.inc).toHaveBeenCalled();
    });
  });

  describe('recordList', () => {
    it('increments list counter with count and status', () => {
      service.recordList(5, 'active');
      expect(listCounter.inc).toHaveBeenCalledWith({ status: 'active' }, 5);
    });

    it('increments list counter with "all" when status not provided', () => {
      service.recordList(3);
      expect(listCounter.inc).toHaveBeenCalledWith({ status: 'all' }, 3);
    });
  });
});
