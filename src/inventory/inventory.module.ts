import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Product } from 'src/product/entities/product.entity';
import { InventoryMovement } from 'src/inventory-movement/entities/inventory-movement.entity';
import { Inventory } from './entities/inventory.entity';
import { CacheService } from '../cache/cache.service';
import { APP_FILTER } from '@nestjs/core';
import { InventoryExceptionFilter } from './filters/inventory-exception.filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, InventoryMovement, Inventory]),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    CacheModule.register(),
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    CacheService,
    {
      provide: APP_FILTER,
      useClass: InventoryExceptionFilter,
    },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
