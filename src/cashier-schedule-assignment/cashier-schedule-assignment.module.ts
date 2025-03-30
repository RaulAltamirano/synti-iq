import { Module } from '@nestjs/common';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';
import { CashierScheduleAssignmentController } from './cashier-schedule-assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { CashierScheduleAssignment } from './entities/cashier-schedule-assignment.entity';

@Module({
  controllers: [CashierScheduleAssignmentController],
  providers: [CashierScheduleAssignmentService],
  imports: [
    TypeOrmModule.forFeature([
      CashierScheduleAssignment,
      TimeBlock,
      CashierProfile,
    ]),
  ],
  exports: [CashierScheduleAssignmentService],
})
export class CashierScheduleAssignmentModule {}
