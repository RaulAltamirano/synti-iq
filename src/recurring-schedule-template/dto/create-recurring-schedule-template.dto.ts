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
import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';

@InputType()
export class CreateRecurringScheduleTemplateDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsUUID()
  storeId: string;

  @Field({ nullable: true })
  @IsUUID()
  cashierId?: string;

  @Field({ nullable: false })
  @IsUUID()
  storeScheduleId: string;

  @Field(() => [RecurrenceRuleDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurrenceRuleDto)
  recurrenceRules: RecurrenceRuleDto[];

  @Field(() => [TimeBlockTemplate], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeBlockTemplate)
  timeBlockTemplates?: TimeBlockTemplate[];

  @Field()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field()
  @IsBoolean()
  generateInitialBlocks: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  initialGenerationEndDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startTimeString?: string;

  @Field({ nullable: true })
  @IsNumber()
  @Min(1)
  durationMinutes?: number;
}
