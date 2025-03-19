import { Test, TestingModule } from '@nestjs/testing';
import { CashierProfileResolver } from './cashier_profile.resolver';
import { CashierProfileService } from './cashier_profile.service';

describe('CashierProfileResolver', () => {
  let resolver: CashierProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashierProfileResolver, CashierProfileService],
    }).compile();

    resolver = module.get<CashierProfileResolver>(CashierProfileResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
