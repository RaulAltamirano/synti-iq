import { IsUUID } from 'class-validator';

export class AssignCashierInput {
  @IsUUID()
  storeId: string;

  @IsUUID()
  cashierId: string;
}
