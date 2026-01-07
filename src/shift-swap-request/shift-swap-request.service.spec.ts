import { Test, TestingModule } from '@nestjs/testing';
import { ShiftSwapRequestService } from './shift-swap-request.service';

describe('ShiftSwapRequestService', () => {
  let service: ShiftSwapRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShiftSwapRequestService],
    }).compile();

    service = module.get<ShiftSwapRequestService>(ShiftSwapRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
