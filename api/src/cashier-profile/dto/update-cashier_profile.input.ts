import { CreateCashierProfileInput } from './create-cashier_profile.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCashierProfileInput extends PartialType(CreateCashierProfileInput) {
  id: string;
}
