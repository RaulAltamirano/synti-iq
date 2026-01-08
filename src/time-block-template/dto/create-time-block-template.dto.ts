import { IsNotEmpty, IsInt, Min, IsOptional, IsUUID, IsString } from 'class-validator';

export class CreateTimeBlockTemplateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  startTimeOffset: number; // Minutes from store opening time

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  endTimeOffset: number; // Minutes from store opening time

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;

  @IsNotEmpty()
  @IsUUID()
  storeId: string;
}
