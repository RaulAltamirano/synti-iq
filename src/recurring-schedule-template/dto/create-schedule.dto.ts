import { RecurrenceRuleDto } from '../entities/recurring-rules.dto';

export class CreateScheduleDto {
  name: string;
  cashierProfileId: string;

  specificDate?: string; // Para eventos únicos (formato: YYYY-MM-DD)

  dayOfWeek?: number;
  recurrenceRules?: RecurrenceRuleDto[];

  startTime: string;
  endTime: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  isActive?: boolean;
}
