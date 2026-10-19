import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovementService } from './inventory-movement.service';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryMovement]),
    CacheModule.register({
      ttl: 300000, // 5 minutes
      max: 100, // maximum number of items in cache
    }),
  ],
  providers: [InventoryMovementService],
  exports: [InventoryMovementService],
})
export class InventoryMovementModule {}
