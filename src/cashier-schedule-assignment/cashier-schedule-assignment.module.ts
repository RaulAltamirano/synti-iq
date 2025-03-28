import { Module } from '@nestjs/common';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';
import { CashierScheduleAssignmentController } from './cashier-schedule-assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CashierScheduleAssignmentController],
  providers: [CashierScheduleAssignmentService],
  imports: [TypeOrmModule.forFeature([])],
  exports: [CashierScheduleAssignmentService],
})
export class CashierScheduleAssignmentModule {}
