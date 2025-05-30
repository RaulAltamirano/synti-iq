import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';
import { CashierScheduleAssignment } from './entities/cashier-schedule-assignment.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { CashierScheduleAssignmentRepository } from './repositories/cashier-schedule-assignment.repository';
import { AssignmentFactory } from './factories/assignment.factory';
import { CacheModule } from '@nestjs/cache-manager';
import { CashierScheduleAssignmentController } from './cashier-schedule-assignment.controller';
import { TimeBlockModule } from 'src/time-block/time-block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashierScheduleAssignment,
      TimeBlock,
      TimeBlockTemplate,
    ]),
    CacheModule.register(),
    TimeBlockModule,
  ],
  controllers: [CashierScheduleAssignmentController],
  providers: [
    CashierScheduleAssignmentService,
    CashierScheduleAssignmentRepository,
    AssignmentFactory,
  ],
  exports: [CashierScheduleAssignmentService],
})
export class CashierScheduleAssignmentModule {}
