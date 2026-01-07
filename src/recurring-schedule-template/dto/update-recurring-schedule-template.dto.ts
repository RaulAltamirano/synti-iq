import { InputType, Field } from '@nestjs/graphql';
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

@InputType()
export class UpdateRecurringScheduleTemplateDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: false })
  @IsUUID()
  storeScheduleId: string;

  @Field(() => [RecurrenceRuleDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurrenceRuleDto)
  recurrenceRules?: RecurrenceRuleDto[];

  @Field(() => [TimeBlockTemplate], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeBlockTemplate)
  timeBlockTemplates?: TimeBlockTemplate[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startTimeString?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @Field()
  @IsBoolean()
  regenerateFutureBlocks: boolean;
}
