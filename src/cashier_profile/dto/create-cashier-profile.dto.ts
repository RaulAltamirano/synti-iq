import { IsString, IsUUID, IsOptional, IsDate } from 'class-validator';

export class CreateCashierProfileDto {
  @IsUUID()
  storeId: string;

  @IsString()
  branchOffice: string;

  @IsString()
  cashierNumber: string;

  @IsOptional()
  @IsUUID()
  assignedScheduleId?: string;

  @IsOptional()
  @IsDate()
  shiftStartTime?: Date;

  @IsOptional()
  @IsDate()
  shiftEndTime?: Date;
}
