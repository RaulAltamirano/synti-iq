import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ProfileActivityService } from './profile-activity.service';
import { UserProfile } from '../entities/user_profile.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';

describe('ProfileActivityService', () => {
  let service: ProfileActivityService;
  let userProfileRepository: Repository<UserProfile>;
  let cashierProfileRepository: Repository<CashierProfile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileActivityService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: {
            findOne: jest.fn(),
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
          provide: getRepositoryToken(BusinessProfile),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileActivityService>(ProfileActivityService);
    userProfileRepository = module.get<Repository<UserProfile>>(getRepositoryToken(UserProfile));
    cashierProfileRepository = module.get<Repository<CashierProfile>>(
      getRepositoryToken(CashierProfile),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return false for non-operational roles', async () => {
    const result = await service.getOnlineStatus('user-id', SystemRole.ADMIN);
    expect(result).toBe(false);
  });

  it('should return false if user profile not found', async () => {
    jest.spyOn(userProfileRepository, 'findOne').mockResolvedValue(null);

    const result = await service.getOnlineStatus('user-id', SystemRole.CASHIER);
    expect(result).toBe(false);
  });

  it('should update last activity for cashier', async () => {
    const mockProfile = {
      id: 'profile-id',
      userId: 'user-id',
      profileId: 'cashier-id',
      profileType: SystemRole.CASHIER,
    };

    jest.spyOn(userProfileRepository, 'findOne').mockResolvedValue(mockProfile as UserProfile);
    jest.spyOn(cashierProfileRepository, 'update').mockResolvedValue({ affected: 1 } as any);

    await service.updateLastActivity('user-id', SystemRole.CASHIER);

    expect(cashierProfileRepository.update).toHaveBeenCalledWith('cashier-id', {
      lastActivityAt: expect.any(Date),
    });
  });
});
