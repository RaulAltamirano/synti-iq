import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';

export class FilterUserDto extends BasePaginationParams {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsBoolean()
  isPendingApproval?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
