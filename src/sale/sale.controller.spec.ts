import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';
import { applyAuthGuardOverrides } from 'src/test-utils/apply-auth-guard-overrides';

describe('SaleController', () => {
  let controller: SaleController;

  beforeEach(async () => {
    const module: TestingModule = await applyAuthGuardOverrides(
      Test.createTestingModule({
        controllers: [SaleController],
        providers: [{ provide: SaleService, useValue: {} }],
      }),
    ).compile();

    controller = module.get<SaleController>(SaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
