import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';

export class StoreFilterDto extends BasePaginationParams {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minDailySalesTarget?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDailySalesTarget?: number;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;
}
