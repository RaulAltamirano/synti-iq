import { Test, TestingModule } from '@nestjs/testing';
import { CashierScheduleAssignmentController } from './cashier-schedule-assignment.controller';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';

describe('CashierScheduleAssignmentController', () => {
  let controller: CashierScheduleAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashierScheduleAssignmentController],
      providers: [CashierScheduleAssignmentService],
    }).compile();

    controller = module.get<CashierScheduleAssignmentController>(CashierScheduleAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
