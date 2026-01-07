import { Test, TestingModule } from '@nestjs/testing';
import { StoreScheduleController } from './store-schedule.controller';
import { StoreScheduleService } from './store-schedule.service';

describe('StoreScheduleController', () => {
  let controller: StoreScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreScheduleController],
      providers: [StoreScheduleService],
    }).compile();

    controller = module.get<StoreScheduleController>(StoreScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
