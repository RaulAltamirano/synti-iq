import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { applyAuthGuardOverrides } from 'src/test-utils/apply-auth-guard-overrides';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await applyAuthGuardOverrides(
      Test.createTestingModule({
        controllers: [ProductController],
        providers: [{ provide: ProductService, useValue: {} }],
      }),
    ).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
