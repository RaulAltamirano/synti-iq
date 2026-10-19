import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, LessThanOrEqual } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { Product } from 'src/product/entities/product.entity';
import {
  InventoryMovement,
  MovementType,
} from 'src/inventory-movement/entities/inventory-movement.entity';
import { Inventory, InventoryStatus } from './entities/inventory.entity';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class InventoryService {
  private readonly CACHE_PREFIX = 'inventory_';
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  private async executeInTransaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < maxRetries; i++) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await operation(queryRunner);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        lastError = error;
        if (error.code === '40P01') {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
          continue;
        }
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
    throw lastError;
  }

  async createMovement(createInventoryDto: CreateInventoryDto): Promise<InventoryMovement> {
    return this.executeInTransaction(async queryRunner => {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: createInventoryDto.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: createInventoryDto.productId },
      });

      if (!inventory) {
        throw new NotFoundException('Inventory not found for this product');
      }

      const movement = queryRunner.manager.create(InventoryMovement, {
        productId: createInventoryDto.productId,
        storeId: inventory.storeId,
        userId: createInventoryDto.userId,
        quantity: createInventoryDto.quantity,
        operation: this.getOperationType(createInventoryDto.type),
        previousQuantity: inventory.quantity,
        newQuantity: this.calculateNewQuantity(inventory.quantity, createInventoryDto),
        metadata: {
          type: createInventoryDto.type,
          unitPrice: createInventoryDto.unitPrice,
          reference: createInventoryDto.reference,
          notes: createInventoryDto.notes,
        },
      });

      await this.updateInventoryAndProduct(queryRunner, inventory, product, createInventoryDto);
      const savedMovement = await queryRunner.manager.save(movement);

      await this.invalidateCache(createInventoryDto.productId);

      return savedMovement;
    });
  }

  private getOperationType(type: MovementType): 'add' | 'remove' | 'set' {
    switch (type) {
      case MovementType.PURCHASE:
      case MovementType.RETURN:
        return 'add';
      case MovementType.SALE:
        return 'remove';
      case MovementType.ADJUSTMENT:
        return 'set';
      default:
        throw new BadRequestException('Invalid movement type');
    }
  }

  private calculateNewQuantity(currentQuantity: number, dto: CreateInventoryDto): number {
    switch (dto.type) {
      case MovementType.ADJUSTMENT:
        return dto.quantity;
      case MovementType.SALE:
        return currentQuantity - dto.quantity;
      case MovementType.PURCHASE:
      case MovementType.RETURN:
        return currentQuantity + dto.quantity;
      default:
        throw new BadRequestException('Invalid movement type');
    }
  }

  private async updateInventoryAndProduct(
    queryRunner: QueryRunner,
    inventory: Inventory,
    product: Product,
    dto: CreateInventoryDto,
  ): Promise<void> {
    switch (dto.type) {
      case MovementType.PURCHASE:
      case MovementType.RETURN:
        inventory.quantity += dto.quantity;
        inventory.lastReceivedAt = new Date();
        break;
      case MovementType.SALE:
        if (inventory.availableQuantity < dto.quantity) {
          throw new BadRequestException('Insufficient stock');
        }
        inventory.quantity -= dto.quantity;
        inventory.lastSoldAt = new Date();
        break;
      case MovementType.ADJUSTMENT:
        inventory.quantity = dto.quantity;
        inventory.lastStockCheck = new Date();
        break;
    }

    product.totalStock = inventory.quantity;
    this.updateStockAlerts(product, inventory);

    await queryRunner.manager.save(inventory);
    await queryRunner.manager.save(product);
  }

  private updateStockAlerts(product: Product, inventory: Inventory): void {
    product.stockAlerts = {
      lowStock: inventory.quantity <= inventory.minimumStock,
      outOfStock: inventory.quantity === 0,
      overStock: inventory.quantity >= inventory.maximumStock,
    };
  }

  private async invalidateCache(productId: string): Promise<void> {
    await this.cacheService.invalidate(`${this.CACHE_PREFIX}*${productId}*`);
  }

  async getProductStock(productId: string): Promise<number> {
    return this.cacheService.get(
      `${this.CACHE_PREFIX}stock_${productId}`,
      async () => {
        const inventory = await this.inventoryRepository.findOne({
          where: { productId },
        });

        if (!inventory) {
          throw new NotFoundException('Inventory not found for this product');
        }

        return inventory.quantity;
      },
      { staleWhileRevalidate: true },
    );
  }

  async getProductMovements(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ movements: InventoryMovement[]; total: number }> {
    return this.cacheService.get(
      `${this.CACHE_PREFIX}movements_${productId}_${page}_${limit}`,
      async () => {
        const [movements, total] = await this.movementRepository.findAndCount({
          where: { productId },
          relations: ['product'],
          skip: (page - 1) * limit,
          take: limit,
          order: { createdAt: 'DESC' },
        });

        return { movements, total };
      },
      { staleWhileRevalidate: true },
    );
  }

  async getLowStockProducts(threshold: number = 0): Promise<Product[]> {
    return this.cacheService.get(
      `${this.CACHE_PREFIX}low_stock_${threshold}`,
      async () => {
        return this.productRepository.find({
          where: {
            totalStock: LessThanOrEqual(threshold),
            isActive: true,
          },
        });
      },
      { ttl: 60 }, // Cache for 1 minute only
    );
  }

  async getInventoryStatus(productId: string): Promise<InventoryStatus> {
    return this.cacheService.get(
      `${this.CACHE_PREFIX}status_${productId}`,
      async () => {
        const inventory = await this.inventoryRepository.findOne({
          where: { productId },
        });

        if (!inventory) {
          throw new NotFoundException('Inventory not found for this product');
        }

        return inventory.status;
      },
      { staleWhileRevalidate: true },
    );
  }

  async getProductsByStatus(status: InventoryStatus): Promise<Product[]> {
    return this.cacheService.get(
      `${this.CACHE_PREFIX}products_by_status_${status}`,
      async () => {
        const inventories = await this.inventoryRepository.find({
          where: { status },
          relations: ['product'],
        });

        return inventories.map(inv => inv.product);
      },
      { staleWhileRevalidate: true },
    );
  }
}
