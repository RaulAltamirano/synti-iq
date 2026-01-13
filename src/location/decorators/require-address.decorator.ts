import { SetMetadata } from '@nestjs/common';
import { AddressRequirement } from '../guards/address-required.guard';

export const REQUIRE_ADDRESS_KEY = 'addressRequirement';

export const RequireAddress = (requirement: AddressRequirement) =>
  SetMetadata(REQUIRE_ADDRESS_KEY, requirement);
