import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { CreateTimeBlockTemplateDto } from './create-time-block-template.dto';

export class UpdateTimeBlockTemplateDto extends PartialType(CreateTimeBlockTemplateDto) {
  @IsOptional()
  @IsInt()
  @Min(0)
  startTimeOffset?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  endTimeOffset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
