import { Module } from '@nestjs/common';
import { TimeBlockTemplateService } from './time-block-template.service';
import { TimeBlockTemplateController } from './time-block-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { TimeBlockTemplate } from './entities/time-block-template.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { RecurrenceModule } from 'src/shared/recurrence/recurrence.module';

@Module({
  controllers: [TimeBlockTemplateController],
  providers: [TimeBlockTemplateService],
  imports: [
    TypeOrmModule.forFeature([RecurringScheduleTemplate, TimeBlockTemplate, TimeBlock]),
    RecurrenceModule,
  ],
  exports: [TimeBlockTemplateService, TypeOrmModule],
})
export class TimeBlockTemplateModule {}
