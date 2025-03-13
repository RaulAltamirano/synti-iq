import { Test, TestingModule } from '@nestjs/testing';
import { CashRegisterSessionsResolver } from './cash_register_sessions.resolver';
import { CashRegisterSessionsService } from './cash_register_sessions.service';

describe('CashRegisterSessionsResolver', () => {
  let resolver: CashRegisterSessionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashRegisterSessionsResolver, CashRegisterSessionsService],
    }).compile();

    resolver = module.get<CashRegisterSessionsResolver>(CashRegisterSessionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
