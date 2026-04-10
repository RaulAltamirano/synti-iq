import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { QueryRunner } from 'typeorm';
import { Repository } from 'typeorm';
import { ProfileValidationService } from './profile-validation.service';
import { User } from 'src/user/entities/user.entity';
import { UserProfile } from '../entities/user_profile.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';

describe('ProfileValidationService', () => {
  let service: ProfileValidationService;
  let userRepository: Repository<User>;
  let userProfileRepository: Repository<UserProfile>;
  let queryRunner: Partial<QueryRunner>;

  beforeEach(async () => {
    const mockQueryRunner = {
      manager: {
        findOne: jest.fn(),
      },
    };

    queryRunner = mockQueryRunner as unknown as QueryRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileValidationService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: {
            manager: queryRunner.manager,
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
          provide: getRepositoryToken(BusinessProfile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Subscription),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProfileValidationService>(ProfileValidationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userProfileRepository = module.get<Repository<UserProfile>>(getRepositoryToken(UserProfile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return invalid if user not found', async () => {
    (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.validate('user-id', queryRunner as QueryRunner);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('User with ID user-id not found');
  });

  it('should return invalid if user has no role', async () => {
    (queryRunner.manager.findOne as jest.Mock).mockResolvedValue({
      id: 'user-id',
      role: null,
      profile: null,
    });

    const result = await service.validate('user-id', queryRunner as QueryRunner);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('User with ID user-id does not have a role assigned');
  });
});
