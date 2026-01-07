import { Type } from 'class-transformer';
import { IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';

export class SessionFilterDto extends BasePaginationParams {
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
