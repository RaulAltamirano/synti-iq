import { Test, TestingModule } from '@nestjs/testing';
import { ShiftSwapRequestController } from './shift-swap-request.controller';
import { ShiftSwapRequestService } from './shift-swap-request.service';

describe('ShiftSwapRequestController', () => {
  let controller: ShiftSwapRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftSwapRequestController],
      providers: [ShiftSwapRequestService],
    }).compile();

    controller = module.get<ShiftSwapRequestController>(ShiftSwapRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
