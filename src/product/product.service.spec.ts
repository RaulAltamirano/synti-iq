import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { CacheService } from 'src/cache/cache.service';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Record<string, jest.Mock>;
  let cacheService: Record<string, jest.Mock>;
  let inventoryRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnValue({
        getCount: jest.fn().mockResolvedValue(0),
      }),
      getCount: jest.fn().mockResolvedValue(0),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    productRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    cacheService = {
      get: jest.fn((_key: string, fetchFn: () => Promise<unknown>) => fetchFn()),
    };

    inventoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: productRepository },
        { provide: getRepositoryToken(Inventory), useValue: inventoryRepository },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
