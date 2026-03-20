import { Repository } from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';

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
