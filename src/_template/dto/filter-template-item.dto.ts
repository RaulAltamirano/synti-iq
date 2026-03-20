import { IsIn, IsOptional, IsString } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';

export class FilterTemplateItemDto extends BasePaginationParams {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsIn(['id', 'name', 'createdAt', 'status'])
  sortBy?: string = 'createdAt';
}
