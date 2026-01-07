import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierProfileModule } from 'src/cashier_profile/cashier_profile.module';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { StoreModule } from 'src/store/store.module';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { TimeBlockModule } from 'src/time-block/time-block.module';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [
    TypeOrmModule.forFeature([RecurringScheduleTemplate, TimeBlockTemplate]),
    CashierProfileModule,
    StoreModule,
    TimeBlockModule,
    ScheduleModule,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
