import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InventoryMovementService } from './inventory-movement.service';
import { InventoryMovement } from './entities/inventory-movement.entity';

describe('InventoryMovementService', () => {
  let service: InventoryMovementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryMovementService,
        { provide: getRepositoryToken(InventoryMovement), useValue: {} },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    service = module.get<InventoryMovementService>(InventoryMovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
