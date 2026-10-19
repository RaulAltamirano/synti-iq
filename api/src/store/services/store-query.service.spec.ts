import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { StoreQueryService } from './store-query.service';
import { Store } from 'src/store/entities/store.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { UserService } from 'src/user/user.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { SystemRole } from 'src/shared/enums/roles.enum';

const buildQueryChain = () => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(0),
  getMany: jest.fn().mockResolvedValue([]),
});

describe('StoreQueryService', () => {
  let service: StoreQueryService;
  let storeRepo: { findOne: jest.Mock; createQueryBuilder: jest.Mock };
  let cashierRepo: { findOne: jest.Mock };
  let userService: { getUserRole: jest.Mock };
  let userProfileService: { getUserProfile: jest.Mock };
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    storeRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => buildQueryChain()),
    };
    cashierRepo = { findOne: jest.fn() };
    userService = { getUserRole: jest.fn() };
    userProfileService = { getUserProfile: jest.fn() };
    cacheManager = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };

    const mockObservability: Pick<ObservabilityService, 'withSpan'> = {
      withSpan: jest.fn(<T>(_name: string, fn: (s: unknown) => Promise<T>) =>
        fn({ setAttribute: jest.fn() }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreQueryService,
        { provide: getRepositoryToken(Store), useValue: storeRepo },
        { provide: getRepositoryToken(CashierProfile), useValue: cashierRepo },
        { provide: UserService, useValue: userService },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: ObservabilityService, useValue: mockObservability },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<StoreQueryService>(StoreQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('sets businessProfileId on filters for CASHIER from assigned store', async () => {
      userService.getUserRole.mockResolvedValue(SystemRole.CASHIER);
      userProfileService.getUserProfile.mockResolvedValue({
        profileId: 'cashier-profile-uuid',
        profileType: SystemRole.CASHIER,
      });
      cashierRepo.findOne.mockResolvedValue({
        store: { businessProfileId: 'bp-123' },
      });

      const filters = {} as never;
      await service.findAll(filters, 'user-1');

      expect((filters as { businessProfileId?: string }).businessProfileId).toBe('bp-123');
    });

    it('throws ForbiddenException when CASHIER has no store', async () => {
      userService.getUserRole.mockResolvedValue(SystemRole.CASHIER);
      userProfileService.getUserProfile.mockResolvedValue({
        profileId: 'cashier-profile-uuid',
        profileType: SystemRole.CASHIER,
      });
      cashierRepo.findOne.mockResolvedValue({ store: null });

      await expect(service.findAll({} as never, 'user-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns cached result without querying DB on cache hit', async () => {
      const cached = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      cacheManager.get.mockImplementation((key: string) => {
        if (key === 'store:_version') return Promise.resolve(1);
        return Promise.resolve(cached);
      });

      const result = await service.findAll({} as never);

      expect(storeRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(result).toBe(cached);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when store does not exist', async () => {
      storeRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns store when no userId provided (no auth check)', async () => {
      const store = {
        id: 'store-1',
        businessProfileId: 'bp-1',
        schedules: [],
        cashiers: [],
        paymentMethods: [],
      };
      storeRepo.findOne.mockResolvedValue(store);

      const result = await service.findOne('store-1');

      expect(result).toBe(store);
      expect(userService.getUserRole).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException for role that is neither BUSINESS_OWNER nor CASHIER', async () => {
      storeRepo.findOne.mockResolvedValue({
        id: 'store-1',
        businessProfileId: 'bp-1',
        schedules: [],
        cashiers: [],
        paymentMethods: [],
      });
      userService.getUserRole.mockResolvedValue(SystemRole.CUSTOMER);

      await expect(service.findOne('store-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('validateStore', () => {
    it('throws NotFoundException when store not found', async () => {
      storeRepo.findOne.mockResolvedValue(null);

      await expect(service.validateStore('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns store when found', async () => {
      const store = { id: 'store-1' };
      storeRepo.findOne.mockResolvedValue(store);

      const result = await service.validateStore('store-1');

      expect(result).toBe(store);
    });
  });

  describe('invalidateListCache', () => {
    it('bumps the version key', async () => {
      await service.invalidateListCache();

      expect(cacheManager.set).toHaveBeenCalledWith(
        'store:_version',
        expect.any(Number),
        expect.any(Number),
      );
    });
  });
});
