import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileApprovalService } from './profile-approval.service';
import { UserProfile } from '../entities/user_profile.entity';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery_profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider_profile/entities/provider_profile.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';

describe('ProfileApprovalService', () => {
  let service: ProfileApprovalService;
  let userProfileRepository: Repository<UserProfile>;
  let cashierProfileRepository: Repository<CashierProfile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileApprovalService,
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
          },
        },
        {
          provide: getRepositoryToken(DeliveryProfile),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderProfile),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileApprovalService>(ProfileApprovalService);
    userProfileRepository = module.get<Repository<UserProfile>>(getRepositoryToken(UserProfile));
    cashierProfileRepository = module.get<Repository<CashierProfile>>(
      getRepositoryToken(CashierProfile),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return approved for non-approval roles', async () => {
    const result = await service.getApprovalStatus('user-id', SystemRole.ADMIN);

    expect(result.isApproved).toBe(true);
    expect(result.approvedAt).toBeNull();
    expect(result.approvedBy).toBeNull();
  });

  it('should return approval status for cashier', async () => {
    const mockProfile = {
      id: 'profile-id',
      userId: 'user-id',
      profileId: 'cashier-id',
      profileType: SystemRole.CASHIER,
    };

    const mockCashier = {
      id: 'cashier-id',
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: 'admin-id',
    };

    jest.spyOn(userProfileRepository, 'findOne').mockResolvedValue(mockProfile as UserProfile);
    jest
      .spyOn(cashierProfileRepository, 'findOne')
      .mockResolvedValue(mockCashier as CashierProfile);

    const result = await service.getApprovalStatus('user-id', SystemRole.CASHIER);

    expect(result.isApproved).toBe(true);
    expect(result.approvedAt).toBe(mockCashier.approvedAt);
    expect(result.approvedBy).toBe('admin-id');
  });

  it('should return not approved if profile not found', async () => {
    jest.spyOn(userProfileRepository, 'findOne').mockResolvedValue(null);

    const result = await service.getApprovalStatus('user-id', SystemRole.CASHIER);

    expect(result.isApproved).toBe(false);
    expect(result.approvedAt).toBeNull();
    expect(result.approvedBy).toBeNull();
  });
});
