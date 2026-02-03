import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ProfileFactoryService } from './profile-factory.service';
import {
  CashierProfileStrategy,
  DeliveryProfileStrategy,
  ProviderProfileStrategy,
  CustomerProfileStrategy,
} from '../strategies/profile-creation.strategy';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import { Store } from 'src/store/entities/store.entity';

describe('ProfileFactoryService', () => {
  let service: ProfileFactoryService;
  let cashierStrategy: CashierProfileStrategy;
  let deliveryStrategy: DeliveryProfileStrategy;
  let providerStrategy: ProviderProfileStrategy;
  let customerStrategy: CustomerProfileStrategy;
  let queryRunner: Partial<QueryRunner>;

  beforeEach(async () => {
    const mockQueryRunner = {
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    };

    queryRunner = mockQueryRunner as QueryRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileFactoryService,
        {
          provide: CashierProfileStrategy,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: DeliveryProfileStrategy,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ProviderProfileStrategy,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CustomerProfileStrategy,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CashierProfile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DeliveryProfile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProviderProfile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CustomerProfile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Store),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProfileFactoryService>(ProfileFactoryService);
    cashierStrategy = module.get<CashierProfileStrategy>(CashierProfileStrategy);
    deliveryStrategy = module.get<DeliveryProfileStrategy>(DeliveryProfileStrategy);
    providerStrategy = module.get<ProviderProfileStrategy>(ProviderProfileStrategy);
    customerStrategy = module.get<CustomerProfileStrategy>(CustomerProfileStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create cashier profile', async () => {
    const mockProfileId = 'cashier-id';
    jest.spyOn(cashierStrategy, 'create').mockResolvedValue(mockProfileId);

    const result = await service.createProfile(
      SystemRole.CASHIER,
      { storeId: 'store-id' },
      queryRunner as QueryRunner,
    );

    expect(result).toBe(mockProfileId);
    expect(cashierStrategy.create).toHaveBeenCalled();
  });

  it('should create delivery profile', async () => {
    const mockProfileId = 'delivery-id';
    jest.spyOn(deliveryStrategy, 'create').mockResolvedValue(mockProfileId);

    const result = await service.createProfile(
      SystemRole.DELIVERY,
      { vehicleType: 'car' },
      queryRunner as QueryRunner,
    );

    expect(result).toBe(mockProfileId);
    expect(deliveryStrategy.create).toHaveBeenCalled();
  });

  it('should return null for admin role', async () => {
    const result = await service.createProfile(SystemRole.ADMIN, {}, queryRunner as QueryRunner);

    expect(result).toBeNull();
  });

  it('should throw error if queryRunner is missing for specific profile', async () => {
    await expect(
      service.createProfile(SystemRole.CASHIER, { storeId: 'store-id' }, null as any),
    ).rejects.toThrow('QueryRunner is required');
  });
});
