import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsResolver } from './transactions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashRegisterSession } from 'src/cash_register_session/entities/cash_register_session.entity';

@Module({
  providers: [TransactionsResolver, TransactionsService],
  imports: [TypeOrmModule.forFeature([CashRegisterSession])],
  exports: [TypeOrmModule, TransactionsService],
})
export class TransactionsModule {}
