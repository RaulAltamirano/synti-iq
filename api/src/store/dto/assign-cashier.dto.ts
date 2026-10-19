import { IsUUID } from 'class-validator';

export class AssignCashierDto {
  @IsUUID()
  cashierId: string;
}
