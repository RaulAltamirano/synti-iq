import { EntityManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TimeBlock } from '../entities/time-block.entity';
import { ITimeBlockComponent } from '../interface/time-block-component.interface.ts';
import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';
import { AssignmentStatus } from 'src/cashier-schedule-assignment/enums/assignment-status.dto';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';

export class TimeBlockLeaf implements ITimeBlockComponent {
  constructor(
    private timeBlock: TimeBlock,
    private entityManager: EntityManager,
  ) {}

  getId(): string {
    return this.timeBlock.id;
  }

  getStartTime(): Date {
    return this.timeBlock.startTime;
  }

  getEndTime(): Date {
    return this.timeBlock.endTime;
  }

  isAvailable(): boolean {
    return this.timeBlock.isAvailable;
  }

  getAvailableSlots(): number {
    return this.timeBlock.maxAssignments;
  }

  async getAssignments(): Promise<CashierScheduleAssignment[]> {
    return this.entityManager.find(CashierScheduleAssignment, {
      where: {
        timeBlockId: this.timeBlock.id,
        status: AssignmentStatus.SCHEDULED,
      },
      relations: ['cashier'],
    });
  }
}

export class RecurringTimeBlockComposite implements ITimeBlockComponent {
  private children: ITimeBlockComponent[] = [];

  constructor(
    private readonly template: RecurringScheduleTemplate,
    private readonly entityManager: EntityManager,
  ) {}

  async initialize(startDate: Date, endDate: Date): Promise<void> {
    const timeBlocks = await this.entityManager.find(TimeBlock, {
      where: {
        templateId: this.template.id,
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate),
      },
    });

    this.children = timeBlocks.map(timeBlock => new TimeBlockLeaf(timeBlock, this.entityManager));
  }

  getId(): string {
    return this.template.id;
  }

  getStartTime(): Date {
    return this.template.startDate;
  }

  getEndTime(): Date {
    return this.template.endDate;
  }

  isAvailable(): boolean {
    return this.template.isActive;
  }

  getAvailableSlots(): number {
    return this.children.reduce((total, child) => total + child.getAvailableSlots(), 0);
  }

  async getAssignments(): Promise<CashierScheduleAssignment[]> {
    const assignmentsArrays = await Promise.all(this.children.map(child => child.getAssignments()));

    return assignmentsArrays.flat();
  }

  getChildren(): ITimeBlockComponent[] {
    return this.children;
  }

  async applyToFutureBlocks(changes: any, fromDate: Date): Promise<void> {
    const futureBlocks = await this.entityManager.find(TimeBlock, {
      where: {
        templateId: this.template.id,
        startTime: MoreThanOrEqual(fromDate),
      },
    });

    for (const block of futureBlocks) {
      if (changes.maxAssignments !== undefined) {
        block.maxAssignments = changes.maxAssignments;
      }

      if (changes.isAvailable !== undefined) {
        block.isAvailable = changes.isAvailable;
      }

      if (changes.startTime !== undefined || changes.endTime !== undefined) {
        const blockDate = new Date(block.startTime);

        if (changes.startTime) {
          const [hours, minutes] = changes.startTime.split(':').map(Number);
          block.startTime = new Date(blockDate);
          block.startTime.setHours(hours, minutes, 0, 0);
        }

        if (changes.endTime) {
          const [hours, minutes] = changes.endTime.split(':').map(Number);
          block.endTime = new Date(blockDate);
          block.endTime.setHours(hours, minutes, 0, 0);

          if (block.endTime < block.startTime) {
            block.endTime.setDate(block.endTime.getDate() + 1);
          }
        }
      }

      await this.entityManager.save(block);
    }
  }
}
