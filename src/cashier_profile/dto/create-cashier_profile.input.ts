import { IsUUID, IsString, IsOptional, IsDate } from 'class-validator';

export class CreateCashierProfileInput {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  storeId: string;

  @IsString()
  branchOffice: string;

  @IsString()
  cashierNumber: string;

  @IsOptional()
  @IsDate()
  shiftStartTime?: Date;

  @IsOptional()
  @IsDate()
  shiftEndTime?: Date;
}
