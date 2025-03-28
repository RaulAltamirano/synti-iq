import { PartialType } from '@nestjs/mapped-types';
import { CreateCashierScheduleAssignmentDto } from './create-cashier-schedule-assignment.dto';

export class UpdateCashierScheduleAssignmentDto extends PartialType(CreateCashierScheduleAssignmentDto) {}
