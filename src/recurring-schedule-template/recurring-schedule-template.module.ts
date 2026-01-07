import { Module } from '@nestjs/common';
import { RecurringScheduleTemplateService } from './recurring-schedule-template.service';
import { RecurringScheduleTemplateController } from './recurring-schedule-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringScheduleTemplate } from './entities/recurring-schedule-template.entity';
import { StoreModule } from 'src/store/store.module';
import { TimeBlockModule } from 'src/time-block/time-block.module';
import { CashierProfileModule } from 'src/cashier_profile/cashier_profile.module';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { ScheduleModule } from 'src/shared/schedule/schedule.module';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';
import { DateTimeModule } from 'src/shared/date-time/date-time.module';
import { RecurrenceModule } from 'src/shared/recurrence/recurrence.module';
import { ErrorHandlingModule } from 'src/shared/error-handling/error-handling.module';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';

@Module({
  controllers: [RecurringScheduleTemplateController],
  providers: [RecurringScheduleTemplateService],
  imports: [
    TypeOrmModule.forFeature([
      RecurringScheduleTemplate,
      TimeBlockTemplate,
      CashierProfile,
      CashierScheduleAssignment,
      TimeBlock,
    ]),
    CashierProfileModule,
    StoreModule,
    ErrorHandlingModule,
    DateTimeModule,
    RecurrenceModule,
    TimeBlockModule,
    ScheduleModule,
  ],
  exports: [RecurringScheduleTemplateService, TypeOrmModule],
})
export class RecurringScheduleTemplateModule {}
