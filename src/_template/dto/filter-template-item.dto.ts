import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';

export class FilterTemplateItemDto extends BasePaginationParams {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'name must not be empty when provided' })
  name?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsIn(['id', 'name', 'createdAt', 'status'])
  sortBy?: string = 'createdAt';
}
