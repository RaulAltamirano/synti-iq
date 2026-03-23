import type { Repository } from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';
import type { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import type { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import type { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import type { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import type { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';

export type SpecificProfileRepository =
  | Repository<CashierProfile>
  | Repository<DeliveryProfile>
  | Repository<ProviderProfile>
  | Repository<BusinessProfile>
  | Repository<CustomerProfile>;

export class ProfileRepositoryHelper {
  static getRepositoryForProfileType(
    profileType: SystemRole,
    repositories: {
      cashier: Repository<CashierProfile>;
      delivery: Repository<DeliveryProfile>;
      provider: Repository<ProviderProfile>;
      business: Repository<BusinessProfile>;
      customer: Repository<CustomerProfile>;
    },
  ): SpecificProfileRepository | null {
    switch (profileType) {
      case SystemRole.CASHIER:
        return repositories.cashier;
      case SystemRole.DELIVERY:
        return repositories.delivery;
      case SystemRole.PROVIDER:
        return repositories.provider;
      case SystemRole.BUSINESS_OWNER:
        return repositories.business;
      case SystemRole.CUSTOMER:
        return repositories.customer;
      default:
        return null;
    }
  }
}
