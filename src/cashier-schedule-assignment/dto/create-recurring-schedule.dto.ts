import {
  IsUUID,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsDate,
  IsBoolean,
  IsString,
  IsDateString,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SimpleRecurrenceRule {
  @IsString()
  frequency: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[];

  @IsNumber()
  @IsOptional()
  interval?: number;
}

export class WeeklyRecurrenceRule {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsNumber()
  @Min(0)
  @Max(1440)
  startTimeMinutes: number;

  @IsNumber()
  @Min(0)
  @Max(1440)
  endTimeMinutes: number;
}
type RecurrenceRule = SimpleRecurrenceRule | WeeklyRecurrenceRule;

export class CreateRecurringScheduleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  storeId: string;

  @IsUUID()
  storeScheduleId: string;

  @IsUUID()
  @IsOptional()
  cashierId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  recurrenceRules: RecurrenceRule[];

  @IsDateString()
  startDate: string | Date;

  @IsBoolean()
  @IsOptional()
  generateInitialBlocks?: boolean = false;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxAssignments?: number = 1;

  @IsString()
  @IsNotEmpty()
  startTimeString: string;
}
