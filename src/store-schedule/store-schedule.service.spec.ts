import { Test, TestingModule } from '@nestjs/testing';
import { StoreScheduleService } from './store-schedule.service';

describe('StoreScheduleService', () => {
  let service: StoreScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreScheduleService],
    }).compile();

    service = module.get<StoreScheduleService>(StoreScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
