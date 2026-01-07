import { Module } from '@nestjs/common';
import { TimeBlockService } from './time-block.service';
import { TimeBlockController } from './time-block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeBlock } from './entities/time-block.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { TimeBlockTemplateService } from 'src/time-block-template/time-block-template.service';
import { Store } from 'src/store/entities/store.entity';
import { TimeBlockFactory } from './factory/time-block-factory';
import { RecurrenceModule } from 'src/shared/recurrence/recurrence.module';

@Module({
  controllers: [TimeBlockController],
  providers: [TimeBlockService, TimeBlockTemplateService, TimeBlockFactory],
  imports: [
    TypeOrmModule.forFeature([TimeBlock, StoreSchedule, TimeBlockTemplate, Store]),
    RecurrenceModule,
  ],
  exports: [TimeBlockService, TimeBlockTemplateService, TimeBlockFactory, TypeOrmModule],
})
export class TimeBlockModule {}
