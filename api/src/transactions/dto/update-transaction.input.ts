import { CreateTransactionInput } from './create-transaction.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTransactionInput extends PartialType(CreateTransactionInput) {
  id: number;
}
