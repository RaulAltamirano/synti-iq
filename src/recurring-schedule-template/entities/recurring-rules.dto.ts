import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray, IsDate } from 'class-validator';

@InputType()
export class RecurrenceRuleDto {
  @Field(() => String)
  @IsString()
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  interval?: number;

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  count?: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  until?: Date;

  @Field(() => [Date], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  exceptions?: Date[];
}
