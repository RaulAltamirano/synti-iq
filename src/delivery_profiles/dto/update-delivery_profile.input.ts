import { CreateDeliveryProfileInput } from './create-delivery_profile.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDeliveryProfileInput extends PartialType(CreateDeliveryProfileInput) {
  id: number;
}
