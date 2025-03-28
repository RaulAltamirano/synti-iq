import { Test, TestingModule } from '@nestjs/testing';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';

describe('CashierScheduleAssignmentService', () => {
  let service: CashierScheduleAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashierScheduleAssignmentService],
    }).compile();

    service = module.get<CashierScheduleAssignmentService>(CashierScheduleAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
