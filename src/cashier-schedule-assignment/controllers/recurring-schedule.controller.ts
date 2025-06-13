import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecurringScheduleService } from '../services/recurring-schedule.service';
import { CreateRecurringAssignmentDto } from '../dto/create-recurring-assignment.dto';
import { TimeBlockTemplate } from '../../time-block-template/entities/time-block-template.entity';
import { CashierScheduleAssignment } from '../entities/cashier-schedule-assignment.entity';


@Controller('recurring-schedule')
export class RecurringScheduleController {
  constructor(
    private readonly recurringScheduleService: RecurringScheduleService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRecurringSchedule(
    @Body() dto: CreateRecurringAssignmentDto,
  ): Promise<TimeBlockTemplate> {
    return this.recurringScheduleService.createRecurringSchedule(dto);
  }

  @Put('swap/:assignment1Id/:assignment2Id')
  @HttpCode(HttpStatus.OK)
  async swapAssignments(
    @Param('assignment1Id') assignment1Id: string,
    @Param('assignment2Id') assignment2Id: string,
  ): Promise<CashierScheduleAssignment[]> {
    return this.recurringScheduleService.swapAssignments(
      assignment1Id,
      assignment2Id,
    );
  }
} 