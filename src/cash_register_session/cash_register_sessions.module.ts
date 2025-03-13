import { Module } from '@nestjs/common';
import { CashRegisterSessionsService } from './cash_register_sessions.service';
import { CashRegisterSessionsResolver } from './cash_register_sessions.resolver';

@Module({
  providers: [CashRegisterSessionsResolver, CashRegisterSessionsService],
})
export class CashRegisterSessionsModule {}
