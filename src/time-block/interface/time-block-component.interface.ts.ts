import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';

export interface ITimeBlockComponent {
  getId(): string;
  getStartTime(): Date;
  getEndTime(): Date;
  isAvailable(): boolean;
  getAvailableSlots(): number;
  getAssignments(): Promise<CashierScheduleAssignment[]>;
}
