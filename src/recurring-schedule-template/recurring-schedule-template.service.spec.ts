import { Test, TestingModule } from '@nestjs/testing';
import { RecurringScheduleTemplateService } from './recurring-schedule-template.service';

describe('RecurringScheduleTemplateService', () => {
  let service: RecurringScheduleTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurringScheduleTemplateService],
    }).compile();

    service = module.get<RecurringScheduleTemplateService>(RecurringScheduleTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
