import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';
import { AssignmentStatus } from './enums/assignment-status.dto';

@Controller('assignments')
export class CashierScheduleAssignmentController {
  constructor(
    private readonly assignmentService: CashierScheduleAssignmentService,
  ) {}


}
