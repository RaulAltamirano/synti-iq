import { Injectable, Logger } from '@nestjs/common';
import { TimeBlock } from '../entities/time-block.entity';
import { RecurringScheduleTemplate } from '../../recurring-schedule-template/entities/recurring-schedule-template.entity';
import { DateUtils } from 'src/shared/utils/date-utils';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { Repository } from 'typeorm';
import { TimeBlockTemplateService } from 'src/time-block-template/time-block-template.service';

export interface TimeBlockData {
  date: Date;
  storeId: string;
  startTimeString: string;
  endTimeString?: string;
  durationMinutes?: number;
  templateId?: string;
  timeBlockTemplateId: string;
  maxAssignments?: number;
  storeScheduleId?: string;
}

@Injectable()
export class TimeBlockFactory {
  constructor(private readonly timeBlockTemplateService: TimeBlockTemplateService) {}
  createTimeBlock(data: TimeBlockData): TimeBlock {
    const startTime = DateUtils.timeStringToDate(data.startTimeString, data.date);

    let endTime: Date;
    if (data.endTimeString) {
      endTime = DateUtils.timeStringToDate(data.endTimeString, data.date);
      if (DateUtils.isCrossingDayBoundary(startTime, endTime)) {
        endTime.setDate(endTime.getDate() + 1);
      }
    } else if (data.durationMinutes) {
      endTime = new Date(startTime.getTime() + data.durationMinutes * 60000);
    } else {
      throw new Error('Debe proporcionar endTimeString o durationMinutes');
    }

    const timeBlock = new TimeBlock();
    timeBlock.storeScheduleId = data.storeScheduleId; // ¡Añade esta línea!
    timeBlock.startTime = startTime;
    timeBlock.templateId = data.templateId;
    timeBlock.endTime = endTime;
    timeBlock.isAvailable = true;
    timeBlock.maxAssignments = data.maxAssignments || 1;

    if (data.templateId) {
      timeBlock.templateId = data.templateId;
    }

    return timeBlock;
  }

  generateTimeBlocksFromTemplate(
    template: RecurringScheduleTemplate,
    dates: Date[],
    storeScheduleId: string,
  ): TimeBlock[] {
    const timeBlocks: TimeBlock[] = [];

    for (const date of dates) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const dayOfWeek = normalizedDate.getDay();

      for (const timeBlockTemplate of template.timeBlockTemplates) {
        if (
          timeBlockTemplate.dayOfWeek !== undefined &&
          timeBlockTemplate.dayOfWeek !== dayOfWeek
        ) {
          continue;
        }

        const blockData: TimeBlockData = {
          date: normalizedDate,
          storeId: template.storeId,
          startTimeString: timeBlockTemplate.startTime,
          endTimeString: timeBlockTemplate.endTime,
          storeScheduleId: storeScheduleId,
          templateId: timeBlockTemplate.id,
          timeBlockTemplateId: '',
          maxAssignments: timeBlockTemplate.maxAssignments || 1,
        };

        const timeBlock = this.createTimeBlock(blockData);
        timeBlock.template = timeBlockTemplate;
        timeBlocks.push(timeBlock);
      }
    }

    return timeBlocks;
  }

  private timeToMinutes(time: Date | string): number {
    const date = typeof time === 'string' ? new Date(time) : time;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes;
  }

  generateTimeBlocksFromSimpleTemplate(
    template: RecurringScheduleTemplate,
    dates: Date[],
    storeScheduleId: string,
    timeBlockTemplateId: string,
  ): TimeBlock[] {
    const timeBlocks: TimeBlock[] = [];

    for (const date of dates) {
      const blockData: TimeBlockData = {
        date,
        storeId: template.storeId,
        startTimeString: template.startTimeString,
        durationMinutes: template.durationMinutes,
        templateId: template.id,
        timeBlockTemplateId: timeBlockTemplateId,
        storeScheduleId: storeScheduleId,
        maxAssignments: 1, // Valor por defecto
      };

      timeBlocks.push(this.createTimeBlock(blockData));
    }

    return timeBlocks;
  }
}
