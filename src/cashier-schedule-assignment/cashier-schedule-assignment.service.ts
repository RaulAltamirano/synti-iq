import { Injectable } from '@nestjs/common';
import { CreateCashierScheduleAssignmentDto } from './dto/create-cashier-schedule-assignment.dto';
import { UpdateCashierScheduleAssignmentDto } from './dto/update-cashier-schedule-assignment.dto';

@Injectable()
export class CashierScheduleAssignmentService {
  create(createCashierScheduleAssignmentDto: CreateCashierScheduleAssignmentDto) {
    return 'This action adds a new cashierScheduleAssignment';
  }

  findAll() {
    return `This action returns all cashierScheduleAssignment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cashierScheduleAssignment`;
  }

  update(id: number, updateCashierScheduleAssignmentDto: UpdateCashierScheduleAssignmentDto) {
    return `This action updates a #${id} cashierScheduleAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashierScheduleAssignment`;
  }
}
