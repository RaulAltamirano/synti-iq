import { QueryRunner } from 'typeorm';
import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { Store } from 'src/store/entities/store.entity';
import { CreateCashierProfileDto } from 'src/cashier-profile/dto/create-cashier-profile.dto';
import { CreateDeliveryProfileDto } from 'src/delivery-profiles/dto/create-delivery-profile.dto';
import { CreateProviderProfileDto } from 'src/provider-profile/dto/create-provider-profile.dto';
import { CreateCustomerProfileDto } from 'src/customer-profile/dto/create-customer-profile.dto';
import { CreateBusinessProfileDto } from 'src/business-profile/dto/create-business-profile.dto';

export interface IProfileCreationStrategy {
  create(data: unknown, queryRunner: QueryRunner): Promise<string>;
}

@Injectable()
export class CashierProfileStrategy implements IProfileCreationStrategy {
  private readonly logger = new Logger(CashierProfileStrategy.name);

  constructor(
    @InjectRepository(CashierProfile)
    private readonly cashierProfileRepository: Repository<CashierProfile>,
  ) {}

  async create(data: unknown, queryRunner: QueryRunner): Promise<string> {
    const cashierData = data as CreateCashierProfileDto & { actingBusinessProfileId?: string };
    const actingBusinessProfileId = cashierData.actingBusinessProfileId;

    if (!actingBusinessProfileId) {
      throw new ForbiddenException(
        'actingBusinessProfileId is required to create a cashier profile',
      );
    }

    const { actingBusinessProfileId: _omitActing, ...profileFields } = cashierData;

    let store: Store | null = null;
    if (profileFields.storeId) {
      const foundStore = await queryRunner.manager.findOne(Store, {
        where: { id: profileFields.storeId },
      });

      if (!foundStore) {
        throw new NotFoundException(
          `Failed to create cashier profile: Store with ID ${profileFields.storeId} not found`,
        );
      }

      if (foundStore.businessProfileId !== actingBusinessProfileId) {
        throw new ForbiddenException('Store does not belong to the acting business');
      }

      store = foundStore;
    }

    const cashierProfile = this.cashierProfileRepository.create({
      ...profileFields,
      store,
      storeId: store?.id ?? null,
    });

    const savedCashier = await queryRunner.manager.save(cashierProfile);
    const profileId = savedCashier.id;

    const verifyCashier = await queryRunner.manager.findOne(CashierProfile, {
      where: { id: profileId },
    });

    if (!verifyCashier) {
      throw new InternalServerErrorException(
        `Failed to create cashier profile: profile with ID ${profileId} not found after creation`,
      );
    }

    return profileId;
  }
}

@Injectable()
export class DeliveryProfileStrategy implements IProfileCreationStrategy {
  private readonly logger = new Logger(DeliveryProfileStrategy.name);

  constructor(
    @InjectRepository(DeliveryProfile)
    private readonly deliveryProfileRepository: Repository<DeliveryProfile>,
  ) {}

  async create(data: unknown, queryRunner: QueryRunner): Promise<string> {
    const deliveryData = data as CreateDeliveryProfileDto;

    const deliveryProfile = this.deliveryProfileRepository.create({
      ...deliveryData,
    });

    const savedDelivery = await queryRunner.manager.save(deliveryProfile);
    const profileId = savedDelivery.id;

    const verifyDelivery = await queryRunner.manager.findOne(DeliveryProfile, {
      where: { id: profileId },
    });

    if (!verifyDelivery) {
      throw new InternalServerErrorException(
        `Failed to create delivery profile: profile with ID ${profileId} not found after creation`,
      );
    }

    return profileId;
  }
}

@Injectable()
export class ProviderProfileStrategy implements IProfileCreationStrategy {
  private readonly logger = new Logger(ProviderProfileStrategy.name);

  constructor(
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
  ) {}

  async create(data: unknown, queryRunner: QueryRunner): Promise<string> {
    const providerData = data as CreateProviderProfileDto;

    const providerProfile = this.providerProfileRepository.create({
      ...providerData,
    });

    const savedProvider = await queryRunner.manager.save(providerProfile);
    const profileId = savedProvider.id;

    const verifyProvider = await queryRunner.manager.findOne(ProviderProfile, {
      where: { id: profileId },
    });

    if (!verifyProvider) {
      throw new InternalServerErrorException(
        `Failed to create provider profile: profile with ID ${profileId} not found after creation`,
      );
    }

    return profileId;
  }
}

@Injectable()
export class BusinessProfileStrategy implements IProfileCreationStrategy {
  private readonly logger = new Logger(BusinessProfileStrategy.name);

  constructor(
    @InjectRepository(BusinessProfile)
    private readonly businessProfileRepository: Repository<BusinessProfile>,
  ) {}

  async create(data: unknown, queryRunner: QueryRunner): Promise<string> {
    const businessData = data as CreateBusinessProfileDto;

    const businessProfile = this.businessProfileRepository.create({
      ...businessData,
    });

    const savedBusiness = await queryRunner.manager.save(businessProfile);
    const profileId = savedBusiness.id;

    const verifyBusiness = await queryRunner.manager.findOne(BusinessProfile, {
      where: { id: profileId },
    });

    if (!verifyBusiness) {
      throw new InternalServerErrorException(
        `Failed to create business profile: profile with ID ${profileId} not found after creation`,
      );
    }

    return profileId;
  }
}

@Injectable()
export class CustomerProfileStrategy implements IProfileCreationStrategy {
  private readonly logger = new Logger(CustomerProfileStrategy.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
  ) {}

  async create(data: unknown, queryRunner: QueryRunner): Promise<string> {
    const customerData = (data as CreateCustomerProfileDto) || {};

    const customerProfile = this.customerProfileRepository.create(customerData);
    const savedCustomer = await queryRunner.manager.save(customerProfile);
    const profileId = savedCustomer.id;

    const verifyCustomer = await queryRunner.manager.findOne(CustomerProfile, {
      where: { id: profileId },
    });

    if (!verifyCustomer) {
      throw new InternalServerErrorException(
        `Failed to create customer profile: profile with ID ${profileId} not found after creation`,
      );
    }

    return profileId;
  }
}
