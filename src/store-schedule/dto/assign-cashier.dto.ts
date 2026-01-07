import { IsUUID, IsOptional } from 'class-validator';

export class AssignCashierDto {
  @IsUUID()
  cashierId: string;

  @IsUUID()
  scheduleId: string;

  @IsUUID()
  @IsOptional()
  recurringTemplateId?: string;
}
