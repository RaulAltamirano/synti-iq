import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeController } from './date-time.controller';
import { DateTimeService } from './date-time.service';

describe('DateTimeController', () => {
  let controller: DateTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DateTimeController],
      providers: [DateTimeService],
    }).compile();

    controller = module.get<DateTimeController>(DateTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
