import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TimeBlock } from '../../time-block/entities/time-block.entity';
import { TimeBlockTemplate } from '../../time-block-template/entities/time-block-template.entity';
import { CashierScheduleAssignment } from '../entities/cashier-schedule-assignment.entity';
import { CreateRecurringAssignmentDto } from '../dto/create-recurring-assignment.dto';
import { addDays, addMinutes, startOfDay } from 'date-fns';

@Injectable()
export class RecurringScheduleService {
  private readonly logger = new Logger(RecurringScheduleService.name);

  constructor(
    @InjectRepository(TimeBlock)
    private timeBlockRepository: Repository<TimeBlock>,
    @InjectRepository(TimeBlockTemplate)
    private timeBlockTemplateRepository: Repository<TimeBlockTemplate>,
    @InjectRepository(CashierScheduleAssignment)
    private assignmentRepository: Repository<CashierScheduleAssignment>,
  ) {}

  /**
   * Creates a recurring schedule assignment for a cashier
   * @param dto The recurring assignment data
   * @param entityManager Optional transaction manager
   * @returns The created time block template
   */
  async createRecurringSchedule(
    dto: CreateRecurringAssignmentDto,
    entityManager?: EntityManager,
  ): Promise<TimeBlockTemplate> {
    const manager = entityManager || this.timeBlockTemplateRepository.manager;

    try {
      // Validate time range
      if (dto.startTimeMinutes >= dto.endTimeMinutes) {
        throw new BadRequestException(
          'Start time must be before end time',
        );
      }

      // Create time block template
      const template = manager.create(TimeBlockTemplate, {
        startTime: dto.startTimeMinutes,
        endTime: dto.endTimeMinutes,
        maxAssignments: dto.maxAssignments || 1,
        templateId: dto.recurringTemplateId || crypto.randomUUID(),
      });

      await manager.save(template);

      // Generate time blocks for the next 3 months
      const timeBlocks = await this.generateTimeBlocks(
        dto,
        template,
        manager,
      );

      // Create assignments for each time block
      await this.createAssignments(
        dto.cashierId,
        timeBlocks,
        manager,
      );

      this.logger.log(
        `Created recurring schedule for cashier ${dto.cashierId} with template ${template.id}`,
      );

      return template;
    } catch (error) {
      this.logger.error(
        `Error creating recurring schedule: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generates time blocks for a given date range
   * @param dto The recurring assignment data
   * @param template The time block template
   * @param manager The entity manager
   * @returns Array of created time blocks
   */
  private async generateTimeBlocks(
    dto: CreateRecurringAssignmentDto,
    template: TimeBlockTemplate,
    manager: EntityManager,
  ): Promise<TimeBlock[]> {
    const timeBlocks: TimeBlock[] = [];
    const startDate = startOfDay(new Date());
    const endDate = addDays(startDate, 90); // Generate for 3 months

    for (
      let date = startDate;
      date <= endDate;
      date = addDays(date, 1)
    ) {
      const dayOfWeek = date.getDay();
      if (dto.daysOfWeek.includes(dayOfWeek)) {
        const startTime = addMinutes(
          startOfDay(date),
          dto.startTimeMinutes,
        );
        const endTime = addMinutes(
          startOfDay(date),
          dto.endTimeMinutes,
        );

        const timeBlock = manager.create(TimeBlock, {
          startTime,
          endTime,
          isAvailable: true,
          maxAssignments: dto.maxAssignments || 1,
          storeScheduleId: dto.storeScheduleId,
          templateId: template.id,
        });

        timeBlocks.push(timeBlock);
      }
    }

    return manager.save(timeBlocks);
  }

  /**
   * Creates assignments for a set of time blocks
   * @param cashierId The cashier ID
   * @param timeBlocks The time blocks to create assignments for
   * @param manager The entity manager
   * @returns Array of created assignments
   */
  private async createAssignments(
    cashierId: string,
    timeBlocks: TimeBlock[],
    manager: EntityManager,
  ): Promise<CashierScheduleAssignment[]> {
    const assignments = timeBlocks.map((timeBlock) =>
      manager.create(CashierScheduleAssignment, {
        cashierId,
        timeBlockId: timeBlock.id,
      }),
    );

    return manager.save(assignments);
  }

  /**
   * Swaps assignments between two cashiers
   * @param assignment1Id First assignment ID
   * @param assignment2Id Second assignment ID
   * @param manager Optional transaction manager
   * @returns Array of updated assignments
   */
  async swapAssignments(
    assignment1Id: string,
    assignment2Id: string,
    entityManager?: EntityManager,
  ): Promise<CashierScheduleAssignment[]> {
    const manager = entityManager || this.assignmentRepository.manager;

    try {
      const [assignment1, assignment2] = await Promise.all([
        manager.findOne(CashierScheduleAssignment, {
          where: { id: assignment1Id },
          relations: ['timeBlock'],
        }),
        manager.findOne(CashierScheduleAssignment, {
          where: { id: assignment2Id },
          relations: ['timeBlock'],
        }),
      ]);

      if (!assignment1 || !assignment2) {
        throw new BadRequestException('One or both assignments not found');
      }

      // Verify time blocks are compatible
      if (
        assignment1.timeBlock.startTime !== assignment2.timeBlock.startTime ||
        assignment1.timeBlock.endTime !== assignment2.timeBlock.endTime
      ) {
        throw new BadRequestException(
          'Time blocks must have the same start and end times',
        );
      }

      // Swap cashier IDs
      const tempCashierId = assignment1.cashierId;
      assignment1.cashierId = assignment2.cashierId;
      assignment2.cashierId = tempCashierId;

      const [updatedAssignment1, updatedAssignment2] = await Promise.all([
        manager.save(assignment1),
        manager.save(assignment2),
      ]);

      this.logger.log(
        `Swapped assignments between cashiers ${assignment1.cashierId} and ${assignment2.cashierId}`,
      );

      return [updatedAssignment1, updatedAssignment2];
    } catch (error) {
      this.logger.error(
        `Error swapping assignments: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
} 