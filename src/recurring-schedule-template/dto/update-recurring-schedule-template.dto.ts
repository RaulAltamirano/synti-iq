import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDate,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { RecurrenceRuleDto } from '../entities/recurring-rules.dto';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';

export class UpdateRecurringScheduleTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsUUID()
  storeScheduleId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurrenceRuleDto)
  recurrenceRules?: RecurrenceRuleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeBlockTemplate)
  timeBlockTemplates?: TimeBlockTemplate[];

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  startTimeString?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @IsBoolean()
  regenerateFutureBlocks: boolean;
}
