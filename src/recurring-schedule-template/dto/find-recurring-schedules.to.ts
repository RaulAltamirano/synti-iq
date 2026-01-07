import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class FindRecurringSchedulesDto {
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsUUID()
  cashierId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
