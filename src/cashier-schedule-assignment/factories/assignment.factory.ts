import { Injectable } from '@nestjs/common';
import { CashierScheduleAssignment } from '../entities/cashier-schedule-assignment.entity';
import { AssignmentStatus } from '../enums/assignment-status.dto';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';

@Injectable()
export class AssignmentFactory {
  createAssignment(dto: CreateAssignmentDto): CashierScheduleAssignment {
    const assignment = new CashierScheduleAssignment();
    assignment.cashierId = dto.cashierId;
    assignment.timeBlockId = dto.timeBlockId;
    assignment.status = AssignmentStatus.SCHEDULED;
    assignment.recurringTemplateId = dto.templateId;
    assignment.actualStartTime = dto.startTime;
    assignment.actualEndTime = dto.endTime;
    return assignment;
  }

  createSwapRequest(
    assignment: CashierScheduleAssignment,
    requestedCashierId: string,
    reason?: string,
  ): CashierScheduleAssignment {
    const updatedAssignment = { ...assignment };
    updatedAssignment.status = AssignmentStatus.SWAP_REQUESTED;
    updatedAssignment.swapRequestedWithId = requestedCashierId;
    updatedAssignment.reason = reason;
    return updatedAssignment;
  }
} 