import {
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateTimeBlockDto {
  @IsNotEmpty()
  @IsDateString()
  startTime: Date;

  @IsNotEmpty()
  @IsDateString()
  endTime: Date;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsNotEmpty()
  @IsUUID()
  storeScheduleId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;
}
