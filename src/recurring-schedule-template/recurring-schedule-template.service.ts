import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecurrenceService } from 'src/shared/recurrence/recurrence.service';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { Repository, EntityManager } from 'typeorm';
import { CreateRecurringScheduleTemplateDto } from './dto/create-recurring-schedule-template.dto';
import { RecurringScheduleTemplate } from './entities/recurring-schedule-template.entity';
import { TimeBlockFactory } from 'src/time-block/factory/time-block-factory';
import { UpdateRecurringScheduleTemplateDto } from './dto/update-recurring-schedule-template.dto';
import {
  ErrorHandlingService,
  ResourceNotFoundError,
} from 'src/shared/error-handling/error-handling.service';

@Injectable()
export class RecurringScheduleTemplateService {
  constructor(
    @InjectRepository(RecurringScheduleTemplate)
    private templateRepository: Repository<RecurringScheduleTemplate>,
    @InjectRepository(TimeBlock)
    private timeBlockRepository: Repository<TimeBlock>,
    private entityManager: EntityManager,
    private timeBlockFactory: TimeBlockFactory,
    private recurrenceService: RecurrenceService,
    private errorHandlingService: ErrorHandlingService,
  ) {}

  async createTemplate(
    dto: CreateRecurringScheduleTemplateDto,
  ): Promise<RecurringScheduleTemplate> {
    return this.errorHandlingService.handleAsync(async () => {
      return this.entityManager.transaction(async transactionalEntityManager => {
        const template = this.templateRepository.create({
          storeId: dto.storeId,
          cashierId: dto.cashierId,
          name: dto.name,
          startDate: dto.startDate,
          endDate: dto.endDate,
          isActive: true,
          recurrenceRules: dto.recurrenceRules,
          timeBlockTemplates: dto.timeBlockTemplates,
          startTimeString: dto.startTimeString,
          durationMinutes: dto.durationMinutes,
        });

        const savedTemplate = await transactionalEntityManager.save(template);

        if (dto.generateInitialBlocks) {
          const generationEndDate =
            dto.initialGenerationEndDate ||
            new Date(dto.startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días por defecto

          await this.generateAndSaveTimeBlocks(
            savedTemplate,
            dto.startDate,
            generationEndDate,
            dto.storeScheduleId,
            'exa',
            transactionalEntityManager,
          );
        }

        return savedTemplate;
      });
    });
  }

  async updateTemplate(
    id: string,
    dto: UpdateRecurringScheduleTemplateDto,
  ): Promise<RecurringScheduleTemplate> {
    return this.errorHandlingService.handleAsync(async () => {
      return this.entityManager.transaction(async transactionalEntityManager => {
        const template = await this.templateRepository.findOne({
          where: { id },
        });

        if (!template) {
          throw new ResourceNotFoundError('Plantilla de horario recurrente', id);
        }

        if (dto.name !== undefined) template.name = dto.name;
        if (dto.isActive !== undefined) template.isActive = dto.isActive;
        if (dto.recurrenceRules !== undefined) template.recurrenceRules = dto.recurrenceRules;
        if (dto.timeBlockTemplates !== undefined)
          template.timeBlockTemplates = dto.timeBlockTemplates;
        if (dto.startDate !== undefined) template.startDate = dto.startDate;
        if (dto.endDate !== undefined) template.endDate = dto.endDate;
        if (dto.startTimeString !== undefined) template.startTimeString = dto.startTimeString;
        if (dto.durationMinutes !== undefined) template.durationMinutes = dto.durationMinutes;

        const updatedTemplate = await transactionalEntityManager.save(template);

        if (dto.regenerateFutureBlocks) {
          const fromDate = new Date(); // Fecha actual
          const toDate =
            template.endDate || new Date(fromDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 días por defecto

          await transactionalEntityManager.delete(TimeBlock, {
            templateId: id,
            startTime: fromDate,
          });

          await this.generateAndSaveTimeBlocks(
            template,
            fromDate,
            toDate,
            dto.storeScheduleId,
            'sdsad',
            transactionalEntityManager,
          );
        }

        return updatedTemplate;
      });
    });
  }

  async findTemplateById(id: string): Promise<RecurringScheduleTemplate> {
    return this.errorHandlingService.handleAsync(async () => {
      const template = await this.templateRepository.findOne({
        where: { id },
      });

      if (!template) {
        throw new ResourceNotFoundError('Plantilla de horario recurrente', id);
      }

      return template;
    });
  }

  async findTemplatesByStore(storeId: string): Promise<RecurringScheduleTemplate[]> {
    return this.errorHandlingService.handleAsync(async () => {
      return this.templateRepository.find({
        where: { storeId },
        order: { createdAt: 'DESC' },
      });
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.errorHandlingService.handleAsync(async () => {
      return this.entityManager.transaction(async transactionalEntityManager => {
        const template = await this.templateRepository.findOne({
          where: { id },
        });

        if (!template) {
          throw new ResourceNotFoundError('Plantilla de horario recurrente', id);
        }

        await transactionalEntityManager.delete(TimeBlock, {
          templateId: id,
        });

        await transactionalEntityManager.delete(RecurringScheduleTemplate, {
          id,
        });
      });
    });
  }

  private async generateAndSaveTimeBlocks(
    template: RecurringScheduleTemplate,
    startDate: Date,
    endDate: Date,
    storeScheduleId: string,
    timeBlockTemplateId: string,
    entityManager: EntityManager,
  ): Promise<void> {
    const occurrenceDates = this.recurrenceService.getOccurrenceDatesForRules(
      template.recurrenceRules,
      startDate,
      endDate,
    );

    const BATCH_SIZE = 10;
    const timeBlockBatches = [];

    const generateBlocks =
      template.timeBlockTemplates?.length > 0
        ? () =>
            this.timeBlockFactory.generateTimeBlocksFromTemplate(
              template,
              occurrenceDates,
              storeScheduleId,
            )
        : () =>
            this.timeBlockFactory.generateTimeBlocksFromSimpleTemplate(
              template,
              occurrenceDates,
              storeScheduleId,
              timeBlockTemplateId,
            );

    const allTimeBlocks = generateBlocks();

    for (let i = 0; i < allTimeBlocks.length; i += BATCH_SIZE) {
      timeBlockBatches.push(allTimeBlocks.slice(i, i + BATCH_SIZE));
    }

    for (const batch of timeBlockBatches) {
      if (batch.length > 0) {
        await entityManager.save(batch);
      }
    }
  }
}
