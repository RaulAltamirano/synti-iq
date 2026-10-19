import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { LocationService } from '../location.service';

export enum AddressRequirement {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

@Injectable()
export class AddressRequiredGuard implements CanActivate {
  constructor(private readonly locationService: LocationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new BadRequestException('User not authenticated');
    }

    const requirement =
      Reflect.getMetadata('addressRequirement', context.getHandler()) ||
      AddressRequirement.SHIPPING;

    if (requirement === AddressRequirement.SHIPPING) {
      const hasAddress = await this.locationService.validateAddressForShipping(user.id);
      if (!hasAddress) {
        throw new BadRequestException(
          'Shipping address is required. Please add a shipping address before proceeding.',
        );
      }
    } else if (requirement === AddressRequirement.BILLING) {
      const hasAddress = await this.locationService.validateAddressForBilling(user.id);
      if (!hasAddress) {
        throw new BadRequestException(
          'Billing address is required. Please add a billing address before proceeding.',
        );
      }
    }

    return true;
  }
}
