import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SaleItem } from 'src/sale-item/entities/sale-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Module({
  controllers: [SaleController],
  providers: [SaleService],
  imports: [TypeOrmModule.forFeature([SaleItem, Transaction])],
  exports: [TypeOrmModule, SaleService],
})
export class SaleModule {}
