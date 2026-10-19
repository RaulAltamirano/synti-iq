import { Module } from '@nestjs/common';
import { SaleItemService } from './sale-item.service';
import { SaleItemController } from './sale-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [SaleItemController],
  providers: [SaleItemService],
  imports: [TypeOrmModule.forFeature([])],
  exports: [TypeOrmModule, SaleItemService],
})
export class SaleItemModule {}
