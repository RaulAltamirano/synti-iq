import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RecurringScheduleService } from '../services/recurring-schedule.service';
import { CreateRecurringAssignmentDto } from '../dto/create-recurring-assignment.dto';
import { TimeBlockTemplate } from '../../time-block-template/entities/time-block-template.entity';
import { CashierScheduleAssignment } from '../entities/cashier-schedule-assignment.entity';


@Resolver(() => TimeBlockTemplate)
export class RecurringScheduleResolver {
  constructor(
    private readonly recurringScheduleService: RecurringScheduleService,
  ) {}

  @Mutation(() => TimeBlockTemplate)
  async createRecurringSchedule(
    @Args('input') dto: CreateRecurringAssignmentDto,
  ): Promise<TimeBlockTemplate> {
    return this.recurringScheduleService.createRecurringSchedule(dto);
  }

  @Mutation(() => [CashierScheduleAssignment])
  async swapAssignments(
    @Args('assignment1Id') assignment1Id: string,
    @Args('assignment2Id') assignment2Id: string,
  ): Promise<CashierScheduleAssignment[]> {
    return this.recurringScheduleService.swapAssignments(
      assignment1Id,
      assignment2Id,
    );
  }
} 