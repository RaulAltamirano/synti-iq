import { Test, TestingModule } from '@nestjs/testing';
import { CashierProfileService } from './cashier_profile.service';

describe('CashierProfileService', () => {
  let service: CashierProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashierProfileService],
    }).compile();

    service = module.get<CashierProfileService>(CashierProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
