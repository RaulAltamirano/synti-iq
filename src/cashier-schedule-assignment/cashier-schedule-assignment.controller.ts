import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';
import { CreateCashierScheduleAssignmentDto } from './dto/create-cashier-schedule-assignment.dto';
import { UpdateCashierScheduleAssignmentDto } from './dto/update-cashier-schedule-assignment.dto';

@Controller('cashier-schedule-assignment')
export class CashierScheduleAssignmentController {
  constructor(private readonly cashierScheduleAssignmentService: CashierScheduleAssignmentService) {}

}
