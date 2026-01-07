import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsDate,
  Matches,
  IsBoolean,
} from 'class-validator';
import { RecurrenceRuleDto } from '../entities/recurring-rules.dto';

export class CreateRecurringScheduleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  cashierProfileId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurrenceRuleDto)
  recurrenceRules?: RecurrenceRuleDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number | number[];

  @IsOptional()
  @IsDate()
  effectiveFrom?: Date;

  @IsOptional()
  @IsDate()
  effectiveUntil?: Date;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El formato de hora debe ser HH:MM',
  })
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El formato de hora debe ser HH:MM',
  })
  endTime: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
