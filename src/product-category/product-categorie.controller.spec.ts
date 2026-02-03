import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategorieController } from './product-categorie.controller';
import { ProductCategorieService } from './product-categorie.service';

describe('ProductCategorieController', () => {
  let controller: ProductCategorieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCategorieController],
      providers: [ProductCategorieService],
    }).compile();

    controller = module.get<ProductCategorieController>(ProductCategorieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
