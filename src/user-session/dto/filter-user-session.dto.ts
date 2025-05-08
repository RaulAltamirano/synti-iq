import { IsOptional, IsNumber, Min, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterUserSessionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsBoolean()
  isValid?: boolean;

  @IsOptional()
  @IsDateString()
  lastUsedAfter?: string;

  @IsOptional()
  @IsDateString()
  lastUsedBefore?: string;
} 