import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategorieService } from './product-categorie.service';

describe('ProductCategorieService', () => {
  let service: ProductCategorieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductCategorieService],
    }).compile();

    service = module.get<ProductCategorieService>(ProductCategorieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
