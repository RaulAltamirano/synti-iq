jest.mock('src/shared/redis/redis.service', () => ({
  RedisService: class RedisService {},
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Product } from 'src/product/entities/product.entity';
import { InventoryMovement } from 'src/inventory-movement/entities/inventory-movement.entity';
import { Inventory } from './entities/inventory.entity';
import { CacheService } from 'src/cache/cache.service';
import { StoreQueryService } from 'src/store/services/store-query.service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(InventoryMovement), useValue: {} },
        { provide: getRepositoryToken(Inventory), useValue: {} },
        {
          provide: getDataSourceToken(),
          useValue: {
            createQueryRunner: jest.fn(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {},
            })),
          },
        },
        { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
        {
          provide: StoreQueryService,
          useValue: { findOne: jest.fn(), listAccessibleStoreIds: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
