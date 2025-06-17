import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsDate, IsUUID } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';
import { AssignmentStatus } from '../enums/assignment-status.dto';

export class AssignmentFilterDto extends BasePaginationParams {
  @IsOptional()
  @IsString()
  cashierId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsUUID()
  timeBlockId?: string;

  @IsOptional()
  @IsUUID()
  recurringTemplateId?: string;
} 