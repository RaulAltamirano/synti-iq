import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { CreateCashierProfileDto } from 'src/cashier-profile/dto/create-cashier-profile.dto';
import { CreateDeliveryProfileDto } from 'src/delivery-profiles/dto/create-delivery-profile.dto';
import { CreateProviderProfileDto } from 'src/provider-profile/dto/create-provider-profile.dto';
import { CreateBusinessProfileDto } from 'src/business-profile/dto/create-business-profile.dto';
import { CreateCustomerProfileDto } from 'src/customer-profile/dto/create-customer-profile.dto';
import {
  CashierProfileStrategy,
  DeliveryProfileStrategy,
  ProviderProfileStrategy,
  BusinessProfileStrategy,
  CustomerProfileStrategy,
} from '../strategies/profile-creation.strategy';

@Injectable()
export class ProfileFactoryService {
  constructor(
    private readonly cashierProfileStrategy: CashierProfileStrategy,
    private readonly deliveryProfileStrategy: DeliveryProfileStrategy,
    private readonly providerProfileStrategy: ProviderProfileStrategy,
    private readonly businessProfileStrategy: BusinessProfileStrategy,
    private readonly customerProfileStrategy: CustomerProfileStrategy,
  ) {}

  async createProfile(
    role: SystemRole,
    data:
      | CreateCashierProfileDto
      | CreateDeliveryProfileDto
      | CreateProviderProfileDto
      | CreateBusinessProfileDto
      | CreateCustomerProfileDto
      | Record<string, unknown>,
    queryRunner: QueryRunner,
  ): Promise<string | null> {
    if (!queryRunner) {
      throw new BadRequestException(
        `QueryRunner is required when creating specific profiles (CASHIER, DELIVERY, PROVIDER, CUSTOMER) for role: ${role}`,
      );
    }

    try {
      switch (role) {
        case SystemRole.CASHIER:
          return await this.cashierProfileStrategy.create(data, queryRunner);

        case SystemRole.DELIVERY:
          return await this.deliveryProfileStrategy.create(data, queryRunner);

        case SystemRole.PROVIDER:
          return await this.providerProfileStrategy.create(data, queryRunner);

        case SystemRole.BUSINESS_OWNER:
          return await this.businessProfileStrategy.create(data, queryRunner);

        case SystemRole.CUSTOMER:
          return await this.customerProfileStrategy.create(data, queryRunner);

        case SystemRole.ADMIN:
        case SystemRole.MANAGER:
          return null;

        default:
          throw new BadRequestException(
            `Unsupported role for profile creation: ${role}. Supported roles are CASHIER, DELIVERY, PROVIDER, ADMIN, MANAGER, CUSTOMER`,
          );
      }
    } catch (error) {
      throw error;
    }
  }
}
