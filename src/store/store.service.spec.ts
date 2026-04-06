import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountInvitationService } from 'src/auth/services/account-invitation.service';
import { MailService } from 'src/mail/mail.service';
import { StoreService } from './store.service';
import { Store } from './entities/store.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { LocationService } from 'src/location/location.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { UserService } from 'src/user/user.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { SystemRole } from 'src/shared/enums/roles.enum';

const createQueryBuilderChain = () => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(0),
  getMany: jest.fn().mockResolvedValue([]),
});

const createCashierQueryBuilderChain = () => ({
  leftJoin: jest.fn().mockReturnThis(),
  leftJoinAndMapOne: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(1),
  getMany: jest.fn().mockResolvedValue([{ id: 'cashier-1', cashierNumber: '01' }]),
});

describe('StoreService', () => {
  let service: StoreService;
  let userService: { getUserRole: jest.Mock; create: jest.Mock };
  let userProfileService: { getUserProfile: jest.Mock };
  let cashierRepo: { findOne: jest.Mock; createQueryBuilder: jest.Mock };
  let storeRepo: { findOne: jest.Mock };
  let accountInvitationService: { createForUser: jest.Mock };
  let mailService: { sendCashierInvitation: jest.Mock };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => createQueryBuilderChain()),
      manager: {
        transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) =>
          fn({
            getRepository: jest.fn().mockReturnValue({
              save: jest.fn().mockResolvedValue({ id: 'store-id' }),
            }),
          }),
        ),
      },
    };

    storeRepo = mockRepo;

    userService = { getUserRole: jest.fn(), create: jest.fn() };
    userProfileService = { getUserProfile: jest.fn() };
    cashierRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => createCashierQueryBuilderChain()),
    };
    accountInvitationService = {
      createForUser: jest.fn().mockResolvedValue({ rawToken: 'raw-invite-token' }),
    };
    mailService = { sendCashierInvitation: jest.fn() };

    const mockObservability: Pick<ObservabilityService, 'withSpan'> = {
      withSpan: jest.fn(<T>(_name: string, fn: (s: unknown) => Promise<T>) =>
        fn({ setAttribute: jest.fn() }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getRepositoryToken(Store), useValue: mockRepo },
        { provide: getRepositoryToken(CashierProfile), useValue: cashierRepo },
        { provide: LocationService, useValue: { createLocation: jest.fn() } },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: UserService, useValue: userService },
        { provide: AccountInvitationService, useValue: accountInvitationService },
        { provide: MailService, useValue: mailService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'CASHIER_INVITATION_TTL_HOURS') return '48';
              if (key === 'FRONTEND_URL') return 'http://localhost:5173';
              return undefined;
            }),
          },
        },
        { provide: ObservabilityService, useValue: mockObservability },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll sets businessProfileId for cashier from assigned store', async () => {
    userService.getUserRole.mockResolvedValue(SystemRole.CASHIER);
    userProfileService.getUserProfile.mockResolvedValue({
      profileId: 'cashier-profile-uuid',
      profileType: SystemRole.CASHIER,
    });
    cashierRepo.findOne.mockResolvedValue({
      store: { businessProfileId: 'bp-123' },
    });

    const filters = {};
    await service.findAll(filters as never, 'user-1');

    expect(cashierRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'cashier-profile-uuid' },
      relations: ['store'],
    });
    expect((filters as { businessProfileId?: string }).businessProfileId).toBe('bp-123');
  });

  it('findAll throws ForbiddenException when cashier has no store', async () => {
    userService.getUserRole.mockResolvedValue(SystemRole.CASHIER);
    userProfileService.getUserProfile.mockResolvedValue({
      profileId: 'cashier-profile-uuid',
      profileType: SystemRole.CASHIER,
    });
    cashierRepo.findOne.mockResolvedValue({ store: null });

    await expect(service.findAll({} as never, 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('findOne throws ForbiddenException when authenticated role is not business owner or cashier', async () => {
    storeRepo.findOne.mockResolvedValue({
      id: 'store-uuid',
      businessProfileId: 'bp-1',
      schedules: [],
      cashiers: [],
      paymentMethods: [],
    });
    userService.getUserRole.mockResolvedValue(SystemRole.CUSTOMER);

    await expect(service.findOne('store-uuid', 'user-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('createCashierUserForStore calls UserService.create with pendingPasswordSetup and sends invitation', async () => {
    storeRepo.findOne.mockResolvedValue({
      id: 'store-uuid',
      businessProfileId: 'bp-xyz',
      schedules: [],
      cashiers: [],
      paymentMethods: [],
    });
    userService.getUserRole.mockResolvedValue(SystemRole.BUSINESS_OWNER);
    userProfileService.getUserProfile.mockResolvedValue({
      profileId: 'bp-xyz',
      profileType: SystemRole.BUSINESS_OWNER,
    });
    userService.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'cashier@example.com',
      firstName: 'C',
    } as never);

    const result = await service.createCashierUserForStore(
      'store-uuid',
      {
        email: 'cashier@example.com',
        firstName: 'C',
        lastName: 'D',
        branchOffice: 'Main',
        cashierNumber: '01',
      },
      'owner-user-id',
    );

    expect(userService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: SystemRole.CASHIER,
        pendingPasswordSetup: true,
        actingBusinessProfileId: 'bp-xyz',
        profileData: expect.objectContaining({
          storeId: 'store-uuid',
          branchOffice: 'Main',
          cashierNumber: '01',
        }),
      }),
    );
    expect(accountInvitationService.createForUser).toHaveBeenCalledWith(
      'new-user-id',
      expect.any(Date),
    );
    expect(mailService.sendCashierInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'cashier@example.com',
        firstName: 'C',
        setPasswordUrl: expect.stringContaining('token='),
      }),
    );
    expect(result.invitationSent).toBe(true);
    expect(result.user.id).toBe('new-user-id');
  });

  it('getCashiersFromStorePaginated returns paginated cashiers after authorization', async () => {
    storeRepo.findOne.mockResolvedValue({
      id: 'store-uuid',
      businessProfileId: 'bp-1',
    });
    userService.getUserRole.mockResolvedValue(SystemRole.BUSINESS_OWNER);
    userProfileService.getUserProfile.mockResolvedValue({
      profileId: 'bp-1',
      profileType: SystemRole.BUSINESS_OWNER,
    });

    const result = await service.getCashiersFromStorePaginated(
      'store-uuid',
      { page: 1, limit: 10, sortBy: 'cashierNumber', sortOrder: 'ASC' },
      'owner-user',
    );

    expect(storeRepo.findOne).toHaveBeenCalledWith({ where: { id: 'store-uuid' } });
    expect(cashierRepo.createQueryBuilder).toHaveBeenCalledWith('cashier');
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('getCashiersFromStorePaginated throws NotFoundException when store not found', async () => {
    storeRepo.findOne.mockResolvedValue(null);

    await expect(
      service.getCashiersFromStorePaginated(
        'missing-store',
        { page: 1, limit: 10, sortBy: 'cashierNumber', sortOrder: 'DESC' },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
