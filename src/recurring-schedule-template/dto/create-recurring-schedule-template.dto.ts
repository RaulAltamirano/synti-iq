import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { RecurrenceRuleDto } from '../entities/recurring-rules.dto';
import { Type } from 'class-transformer';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';

export class CreateRecurringScheduleTemplateDto {
  @IsString()
  name: string;

  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsUUID()
  cashierId?: string;

  @IsUUID()
  storeScheduleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurrenceRuleDto)
  recurrenceRules: RecurrenceRuleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeBlockTemplate)
  timeBlockTemplates?: TimeBlockTemplate[];

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsBoolean()
  generateInitialBlocks: boolean;

  @IsOptional()
  @IsDate()
  initialGenerationEndDate?: Date;

  @IsOptional()
  @IsString()
  startTimeString?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;
}
