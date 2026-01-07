import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GenerateSchedulesDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}
