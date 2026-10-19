import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserFiltersService } from './services/user-filters.service';
import { UserCreationService } from './services/user-creation.service';
import { UserRoleMutationService } from './services/user-role-mutation.service';
import { User } from './entities/user.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import type { FilterBusinessUsersDto } from './dto/filter-business-users.dto';
import { RoleService } from 'src/role/role.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';

function createBusinessUserQueryBuilderMock() {
  const qb = {
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    clone: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
  };
  const countQb = { getCount: jest.fn().mockResolvedValue(2) };
  qb.clone.mockReturnValue(countQb);
  return qb;
}

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };
  let cashierProfileRepository: { findOne: jest.Mock };
  let userProfileService: { getUserProfile: jest.Mock };
  let roleService: { findRoleByUserId: jest.Mock };
  let mockQb: ReturnType<typeof createBusinessUserQueryBuilderMock>;

  beforeEach(async () => {
    mockQb = createBusinessUserQueryBuilderMock();
    userRepository = {
      createQueryBuilder: jest.fn(() => mockQb),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    cashierProfileRepository = { findOne: jest.fn() };
    userProfileService = { getUserProfile: jest.fn() };
    roleService = { findRoleByUserId: jest.fn() };

    const observabilityMock: Pick<ObservabilityService, 'withSpan'> = {
      withSpan: jest.fn(<T>(_name: string, fn: (s: unknown) => Promise<T>) =>
        fn({ setAttribute: jest.fn() }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserFiltersService,
        { provide: UserCreationService, useValue: {} },
        { provide: UserRoleMutationService, useValue: {} },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(CashierProfile), useValue: cashierProfileRepository },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: RedisService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
        { provide: RoleService, useValue: roleService },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
        { provide: ObservabilityService, useValue: observabilityMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('filterUsersByBusiness', () => {
    it('throws BadRequestException when admin without businessProfileId', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.ADMIN });

      await expect(service.filterUsersByBusiness({}, 'admin-user-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.filterUsersByBusiness({}, 'admin-user-id')).rejects.toThrow(
        /businessProfileId is required/,
      );
    });

    it('throws ForbiddenException when role is customer', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.CUSTOMER });

      await expect(service.filterUsersByBusiness({}, 'cust-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('resolves businessProfileId for business_owner and runs query', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.BUSINESS_OWNER });
      userProfileService.getUserProfile.mockResolvedValue({
        profileType: SystemRole.BUSINESS_OWNER,
        profileId: 'bp-uuid-1',
      });

      const result = await service.filterUsersByBusiness(
        { page: 1, limit: 10 } as FilterBusinessUsersDto,
        'owner-id',
      );

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQb.innerJoin).toHaveBeenCalledWith('user.profile', 'profile');
      expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('user.role', 'role');
      expect(result.items).toEqual([]);
      expect(result.total).toBe(2);
    });

    it('resolves businessProfileId for cashier via store', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.CASHIER });
      userProfileService.getUserProfile.mockResolvedValue({
        profileType: SystemRole.CASHIER,
        profileId: 'cashier-prof-id',
      });
      cashierProfileRepository.findOne.mockResolvedValue({
        id: 'cashier-prof-id',
        store: { businessProfileId: 'bp-from-store' },
      });

      await service.filterUsersByBusiness(
        { page: 1, limit: 10 } as FilterBusinessUsersDto,
        'cashier-user-id',
      );

      expect(cashierProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cashier-prof-id' },
        relations: ['store'],
      });
    });

    it('throws ForbiddenException when cashier has no store', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.CASHIER });
      userProfileService.getUserProfile.mockResolvedValue({
        profileType: SystemRole.CASHIER,
        profileId: 'cashier-prof-id',
      });
      cashierProfileRepository.findOne.mockResolvedValue({
        id: 'cashier-prof-id',
        store: null,
      });

      await expect(service.filterUsersByBusiness({}, 'cashier-user-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('uses businessProfileId from query for manager', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.MANAGER });

      await service.filterUsersByBusiness(
        { businessProfileId: 'explicit-bp-id', page: 1, limit: 10 } as FilterBusinessUsersDto,
        'mgr-id',
      );

      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
