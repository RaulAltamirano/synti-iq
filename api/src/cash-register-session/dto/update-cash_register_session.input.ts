import { CreateCashRegisterSessionInput } from './create-cash_register_session.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCashRegisterSessionInput extends PartialType(CreateCashRegisterSessionInput) {
  id: number;
}
