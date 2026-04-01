import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserFiltersService } from './user-filters.service';
import { User } from '../entities/user.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { RoleService } from 'src/role/role.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import type { Span } from '@opentelemetry/api';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import {
  USER_FILTERS_SPAN_ATTRIBUTES,
  USER_FILTERS_SPAN_NAMES,
} from '../constants/user-filters-span.constants';
import type { FilterBusinessUsersDto } from '../dto/filter-business-users.dto';

function createQueryBuilderMock() {
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    clone: jest.fn(),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
  };
  const countQb = { getCount: jest.fn().mockResolvedValue(0) };
  qb.clone.mockReturnValue(countQb);
  return qb;
}

describe('UserFiltersService', () => {
  let service: UserFiltersService;
  let userRepository: { createQueryBuilder: jest.Mock };
  let cacheManager: { get: jest.Mock; set: jest.Mock };
  let userProfileService: { getUserProfile: jest.Mock };
  let roleService: { findRoleByUserId: jest.Mock };
  let cashierProfileRepository: { findOne: jest.Mock };
  let mockObservability: Pick<ObservabilityService, 'withSpan'>;
  let mockQb: ReturnType<typeof createQueryBuilderMock>;
  let spanMock: { setAttribute: jest.Mock };

  beforeEach(async () => {
    mockQb = createQueryBuilderMock();
    userRepository = {
      createQueryBuilder: jest.fn(() => mockQb),
    };
    cacheManager = { get: jest.fn(), set: jest.fn() };
    userProfileService = { getUserProfile: jest.fn() };
    roleService = { findRoleByUserId: jest.fn() };
    cashierProfileRepository = { findOne: jest.fn() };
    spanMock = { setAttribute: jest.fn() };
    mockObservability = {
      withSpan: jest.fn(async <T>(_name: string, fn: (s: Span) => Promise<T>) =>
        fn(spanMock as unknown as Span),
      ),
    } as Pick<ObservabilityService, 'withSpan'>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFiltersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(CashierProfile), useValue: cashierProfileRepository },
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: RoleService, useValue: roleService },
        { provide: ObservabilityService, useValue: mockObservability },
      ],
    }).compile();

    service = module.get<UserFiltersService>(UserFiltersService);
  });

  describe('filterUsers', () => {
    it('returns cached result when present', async () => {
      const cached = {
        items: [],
        total: 3,
        page: 1,
        totalPages: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.filterUsers({ page: 1, limit: 10 });

      expect(result).toEqual(cached);
      expect(userRepository.createQueryBuilder).not.toHaveBeenCalled();
      expect(mockObservability.withSpan).toHaveBeenCalledWith(
        USER_FILTERS_SPAN_NAMES.FILTER_USERS,
        expect.any(Function),
      );
      expect(spanMock.setAttribute).toHaveBeenCalledWith(USER_FILTERS_SPAN_ATTRIBUTES.PAGE, 1);
      expect(spanMock.setAttribute).toHaveBeenCalledWith(USER_FILTERS_SPAN_ATTRIBUTES.TOTAL, 3);
    });

    it('throws InternalServerErrorException when query fails with non-HTTP error', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      mockQb.getManyAndCount.mockRejectedValue(new Error('db connection failed'));

      await expect(service.filterUsers({ page: 1, limit: 10 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('filterUsersByBusiness', () => {
    it('throws BadRequestException when admin omits businessProfileId', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.ADMIN });

      await expect(
        service.filterUsersByBusiness({} as FilterBusinessUsersDto, 'admin-id'),
      ).rejects.toThrow(BadRequestException);

      expect(mockObservability.withSpan).toHaveBeenCalledWith(
        USER_FILTERS_SPAN_NAMES.FILTER_BY_BUSINESS,
        expect.any(Function),
      );
    });

    it('throws ForbiddenException when role is not allowed', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.CUSTOMER });

      await expect(
        service.filterUsersByBusiness({ page: 1, limit: 10 } as FilterBusinessUsersDto, 'u1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('resolves business owner and returns paginated result', async () => {
      roleService.findRoleByUserId.mockResolvedValue({ name: SystemRole.BUSINESS_OWNER });
      userProfileService.getUserProfile.mockResolvedValue({
        profileType: SystemRole.BUSINESS_OWNER,
        profileId: 'bp-1',
      });

      const result = await service.filterUsersByBusiness(
        { page: 1, limit: 10 } as FilterBusinessUsersDto,
        'owner-id',
      );

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(result.items).toEqual([]);
      expect(spanMock.setAttribute).toHaveBeenCalledWith(USER_FILTERS_SPAN_ATTRIBUTES.TOTAL, 0);
    });
  });
});
