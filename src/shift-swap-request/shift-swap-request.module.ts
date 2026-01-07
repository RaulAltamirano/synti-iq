import { Module } from '@nestjs/common';
import { ShiftSwapRequestService } from './shift-swap-request.service';
import { ShiftSwapRequestController } from './shift-swap-request.controller';

@Module({
  controllers: [ShiftSwapRequestController],
  providers: [ShiftSwapRequestService],
})
export class ShiftSwapRequestModule {}
