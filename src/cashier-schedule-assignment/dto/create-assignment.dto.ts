import {
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateAssignmentDto {
  @IsUUID()
  cashierId: string;

  @IsUUID()
  storeScheduleId: string;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAssignments?: number;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrenceType?: RecurrenceType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsUUID()
  timeBlockId?: string;
}

export class RequestShiftSwapDto {
  @IsString()
  assignmentId: string;

  @IsString()
  requestedCashierId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
