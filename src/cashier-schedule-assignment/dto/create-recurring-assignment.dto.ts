import { IsUUID, IsArray, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateRecurringAssignmentDto {
  @IsUUID()
  cashierId: string;

  @IsUUID()
  storeScheduleId: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.

  @IsNumber()
  @Min(0)
  @Max(1440) // 24 hours in minutes
  startTimeMinutes: number;

  @IsNumber()
  @Min(0)
  @Max(1440)
  endTimeMinutes: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAssignments?: number;

  @IsOptional()
  @IsUUID()
  recurringTemplateId?: string;
} 