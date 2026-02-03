import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileService } from './user_profile.service';
import { UserProfile } from './entities/user_profile.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import { ProfileFactoryService } from './services/profile-factory.service';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileActivityService } from './services/profile-activity.service';
import { ProfileApprovalService } from './services/profile-approval.service';

describe('UserProfileService', () => {
  let service: UserProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            manager: {
              save: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(CashierProfile),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryProfile),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderProfile),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CustomerProfile),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ProfileFactoryService,
          useValue: {
            createProfile: jest.fn(),
          },
        },
        {
          provide: ProfileValidationService,
          useValue: {
            validate: jest.fn(),
          },
        },
        {
          provide: ProfileActivityService,
          useValue: {
            getOnlineStatus: jest.fn(),
            getLastActivityAt: jest.fn(),
            updateLastActivity: jest.fn(),
          },
        },
        {
          provide: ProfileApprovalService,
          useValue: {
            getApprovalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
