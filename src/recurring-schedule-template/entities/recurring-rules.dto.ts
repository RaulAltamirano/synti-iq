import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray, IsDate } from 'class-validator';

export class RecurrenceRuleDto {
  @IsString()
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsNumber()
  interval?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;

  @IsOptional()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  until?: Date;

  @IsOptional()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  exceptions?: Date[];
}
