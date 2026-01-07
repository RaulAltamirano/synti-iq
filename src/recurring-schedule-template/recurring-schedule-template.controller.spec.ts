import { Test, TestingModule } from '@nestjs/testing';
import { RecurringScheduleTemplateController } from './recurring-schedule-template.controller';
import { RecurringScheduleTemplateService } from './recurring-schedule-template.service';

describe('RecurringScheduleTemplateController', () => {
  let controller: RecurringScheduleTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecurringScheduleTemplateController],
      providers: [RecurringScheduleTemplateService],
    }).compile();

    controller = module.get<RecurringScheduleTemplateController>(
      RecurringScheduleTemplateController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
