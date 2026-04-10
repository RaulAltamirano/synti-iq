import { Module } from '@nestjs/common';
import { CashRegisterSessionsService } from './cash_register_sessions.service';

@Module({
  providers: [CashRegisterSessionsService],
})
export class CashRegisterSessionsModule {}
