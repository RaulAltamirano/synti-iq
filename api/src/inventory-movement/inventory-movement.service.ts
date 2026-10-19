import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class InventoryMovementService {
  private readonly logger = new Logger(InventoryMovementService.name);
  private readonly metrics = {
    createDuration: new Map<string, number>(),
    queryDuration: new Map<string, number>(),
  };

  constructor(
    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementRepository: Repository<InventoryMovement>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(createInventoryMovementDto: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const startTime = Date.now();
    try {
      const movement = this.inventoryMovementRepository.create(createInventoryMovementDto);
      const savedMovement = await this.inventoryMovementRepository.save(movement);

      await this.invalidateRelatedCache(
        createInventoryMovementDto.storeId,
        createInventoryMovementDto.productId,
      );

      this.logger.log({
        message: 'Inventory movement created',
        movementId: savedMovement.id,
        storeId: savedMovement.storeId,
        productId: savedMovement.productId,
        operation: savedMovement.operation,
      });

      return savedMovement;
    } finally {
      this.metrics.createDuration.set('create', Date.now() - startTime);
    }
  }

  async findAll(
    storeId?: string,
    productId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InventoryMovement[]> {
    const startTime = Date.now();
    try {
      const cacheKey = `movements:${storeId}:${productId}:${startDate}:${endDate}`;
      const cached = await this.cacheManager.get<InventoryMovement[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const queryBuilder = this.inventoryMovementRepository.createQueryBuilder('movement');

      if (storeId) {
        queryBuilder.andWhere('movement.storeId = :storeId', { storeId });
      }

      if (productId) {
        queryBuilder.andWhere('movement.productId = :productId', { productId });
      }

      if (startDate) {
        queryBuilder.andWhere('movement.createdAt >= :startDate', {
          startDate,
        });
      }

      if (endDate) {
        queryBuilder.andWhere('movement.createdAt <= :endDate', { endDate });
      }

      queryBuilder.orderBy('movement.createdAt', 'DESC');

      const movements = await queryBuilder.getMany();

      await this.cacheManager.set(cacheKey, movements, 300000);

      return movements;
    } finally {
      this.metrics.queryDuration.set('findAll', Date.now() - startTime);
    }
  }

  async findOne(id: string): Promise<InventoryMovement> {
    const startTime = Date.now();
    try {
      const cacheKey = `movement:${id}`;
      const cached = await this.cacheManager.get<InventoryMovement>(cacheKey);

      if (cached) {
        return cached;
      }

      const movement = await this.inventoryMovementRepository.findOne({
        where: { id },
      });

      if (movement) {
        await this.cacheManager.set(cacheKey, movement, 300000);
      }

      return movement;
    } finally {
      this.metrics.queryDuration.set('findOne', Date.now() - startTime);
    }
  }

  async update(
    id: string,
    updateInventoryMovementDto: UpdateInventoryMovementDto,
  ): Promise<InventoryMovement> {
    const startTime = Date.now();
    try {
      const movement = await this.inventoryMovementRepository.findOne({
        where: { id },
      });

      if (!movement) {
        throw new Error('Movement not found');
      }

      Object.assign(movement, updateInventoryMovementDto);
      const updatedMovement = await this.inventoryMovementRepository.save(movement);

      await this.invalidateRelatedCache(movement.storeId, movement.productId);
      await this.cacheManager.del(`movement:${id}`);

      return updatedMovement;
    } finally {
      this.metrics.createDuration.set('update', Date.now() - startTime);
    }
  }

  async remove(id: string): Promise<void> {
    const startTime = Date.now();
    try {
      const movement = await this.inventoryMovementRepository.findOne({
        where: { id },
      });

      if (!movement) {
        throw new Error('Movement not found');
      }

      await this.inventoryMovementRepository.remove(movement);

      await this.invalidateRelatedCache(movement.storeId, movement.productId);
      await this.cacheManager.del(`movement:${id}`);
    } finally {
      this.metrics.createDuration.set('remove', Date.now() - startTime);
    }
  }

  private async invalidateRelatedCache(storeId: string, productId: string): Promise<void> {
    const keys = await this.cacheManager.stores.keys();
    const patternsToInvalidate = [
      `movements:${storeId}:*`,
      `movements:*:${productId}`,
      `movements:${storeId}:${productId}:*`,
    ];
    for (const pattern of patternsToInvalidate) {
      const matchingKeys = Array.from(keys).filter(key =>
        String(key).match(new RegExp(pattern.replace('*', '.*'))),
      );
      await Promise.all(matchingKeys.map(key => this.cacheManager.del(String(key))));
    }
  }

  getMetrics() {
    return {
      createDuration: Object.fromEntries(this.metrics.createDuration),
      queryDuration: Object.fromEntries(this.metrics.queryDuration),
    };
  }
}
