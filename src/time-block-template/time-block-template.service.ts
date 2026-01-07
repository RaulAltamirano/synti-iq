import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TimeBlockTemplate } from './entities/time-block-template.entity';
import { TimeBlock } from '../time-block/entities/time-block.entity';
import { CreateTimeBlockTemplateDto } from './dto/create-time-block-template.dto';
import { UpdateTimeBlockTemplateDto } from './dto/update-time-block-template.dto';
import { DateUtils } from 'src/shared/utils/date-utils';
import { addDays, addMinutes, startOfDay } from 'date-fns';
import { RecurrenceService } from '../shared/recurrence/recurrence.service';

@Injectable()
export class TimeBlockTemplateService {
  private readonly logger = new Logger(TimeBlockTemplateService.name);

  constructor(
    @InjectRepository(TimeBlockTemplate)
    private readonly templateRepository: Repository<TimeBlockTemplate>,
    @InjectRepository(TimeBlock)
    private readonly timeBlockRepository: Repository<TimeBlock>,
    private readonly entityManager: EntityManager,
    private readonly recurrenceService: RecurrenceService,
  ) {}

  async createTemplate(template: Partial<TimeBlockTemplate>): Promise<TimeBlockTemplate> {
    const newTemplate = this.templateRepository.create(template);
    return this.templateRepository.save(newTemplate);
  }

  async updateTemplate(
    id: string,
    updates: Partial<TimeBlockTemplate>,
    regenerateFutureBlocks: boolean = false,
  ): Promise<TimeBlockTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Time block template with id ${id} not found`);
    }

    Object.assign(template, updates);
    const updatedTemplate = await this.templateRepository.save(template);

    if (regenerateFutureBlocks) {
      const fromDate = new Date();
      const toDate = template.endDate || addDays(fromDate, 90); // 90 days default

      await this.timeBlockRepository.delete({
        templateId: id,
        startTime: fromDate,
      });

      await this.generateTimeBlocksFromTemplate(
        updatedTemplate,
        fromDate,
        toDate,
        template.storeId,
      );
    }

    return updatedTemplate;
  }

  async generateTimeBlocksFromTemplate(
    template: TimeBlockTemplate,
    startDate: Date,
    endDate: Date,
    storeScheduleId: string,
  ): Promise<TimeBlock[]> {
    const timeBlocks: TimeBlock[] = [];
    const currentDate = new Date(startDate);

    if (template.isRecurring && template.recurrencePattern) {
      const occurrenceDates = this.recurrenceService.getOccurrenceDates(
        template.recurrencePattern,
        startDate,
        endDate,
      );

      for (const date of occurrenceDates) {
        const timeBlock = await this.createTimeBlockFromTemplate(template, date, storeScheduleId);
        timeBlocks.push(timeBlock);
      }
    } else {
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        if (!template.daysOfWeek || template.daysOfWeek.includes(dayOfWeek)) {
          const timeBlock = await this.createTimeBlockFromTemplate(
            template,
            currentDate,
            storeScheduleId,
          );
          timeBlocks.push(timeBlock);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const BATCH_SIZE = 50;
    const savedBlocks: TimeBlock[] = [];

    for (let i = 0; i < timeBlocks.length; i += BATCH_SIZE) {
      const batch = timeBlocks.slice(i, i + BATCH_SIZE);
      const savedBatch = await this.entityManager.save(batch);
      savedBlocks.push(...savedBatch);
    }

    return savedBlocks;
  }

  private async createTimeBlockFromTemplate(
    template: TimeBlockTemplate,
    date: Date,
    storeScheduleId: string,
  ): Promise<TimeBlock> {
    const startTime = addMinutes(startOfDay(date), template.startTimeOffset);
    const endTime = addMinutes(startOfDay(date), template.endTimeOffset);

    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    return this.timeBlockRepository.create({
      startTime,
      endTime,
      isAvailable: true,
      maxAssignments: template.maxAssignments || 1,
      storeScheduleId,
      templateId: template.id,
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Time block template with id ${id} not found`);
    }

    await this.timeBlockRepository.delete({ templateId: id });

    await this.templateRepository.delete(id);
  }

  async getTemplateById(id: string): Promise<TimeBlockTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Time block template with id ${id} not found`);
    }
    return template;
  }

  async getTemplatesByStoreId(storeId: string): Promise<TimeBlockTemplate[]> {
    return await this.templateRepository.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTemplateByTimeOffsets(
    storeId: string,
    startTimeOffset: number,
    endTimeOffset: number,
  ): Promise<TimeBlockTemplate | null> {
    try {
      return await this.templateRepository.findOne({
        where: {
          storeId,
          startTimeOffset,
          endTimeOffset,
        },
      });
    } catch (error) {
      this.logger.error(`Error finding template by time offsets: ${error.message}`, error.stack);
      throw new Error(`Failed to find template by time offsets: ${error.message}`);
    }
  }
}
