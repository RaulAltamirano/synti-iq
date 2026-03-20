import { Test, TestingModule } from '@nestjs/testing';
import { StoreScheduleController } from './store-schedule.controller';
import { StoreScheduleService } from './store-schedule.service';

describe('StoreScheduleController', () => {
  let controller: StoreScheduleController;

  beforeEach(async () => {
    const mockStoreScheduleService = {
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      toggleActive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreScheduleController],
      providers: [
        {
          provide: StoreScheduleService,
          useValue: mockStoreScheduleService,
        },
      ],
    }).compile();

    controller = module.get<StoreScheduleController>(StoreScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
