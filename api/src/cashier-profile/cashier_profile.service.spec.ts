import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashierProfileService } from './cashier_profile.service';
import { CashierProfile } from './entities/cashier_profile.entity';

describe('CashierProfileService', () => {
  let service: CashierProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashierProfileService,
        { provide: getRepositoryToken(CashierProfile), useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<CashierProfileService>(CashierProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
