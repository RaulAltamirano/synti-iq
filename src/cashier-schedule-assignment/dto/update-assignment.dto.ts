import { IsOptional, IsDateString, IsUUID, IsInt, Min, IsBoolean } from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @IsOptional()
  @IsUUID()
  cashierId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;

  @IsOptional()
  @IsBoolean()
  updateFutureBlocks?: boolean;

  @IsOptional()
  @IsDateString()
  updateFromDate?: Date;
}
