import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashRegisterSession } from 'src/cash_register_session/entities/cash_register_session.entity';

@Module({
  providers: [TransactionsService],
  imports: [TypeOrmModule.forFeature([CashRegisterSession])],
  exports: [TypeOrmModule, TransactionsService],
})
export class TransactionsModule {}
