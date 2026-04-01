import {
  Inject,
  Injectable,
  Logger,
  ForbiddenException,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { createHash } from 'node:crypto';
import { User } from '../entities/user.entity';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { FilterBusinessUsersDto } from '../dto/filter-business-users.dto';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { RoleService } from 'src/role/role.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import {
  USER_FILTERS_SPAN_ATTRIBUTES,
  USER_FILTERS_SPAN_NAMES,
} from '../constants/user-filters-span.constants';

const BUSINESS_USER_SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'createdAt',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  lastLogin: 'lastLogin',
  updatedAt: 'updatedAt',
};

@Injectable()
export class UserFiltersService {
  private readonly logger = new Logger(UserFiltersService.name);

  private readonly CACHE_TTL = 1800;
  private readonly CACHE_PREFIX = 'users:filter:';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CashierProfile)
    private readonly cashierProfileRepository: Repository<CashierProfile>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly userProfileService: UserProfileService,
    private readonly roleService: RoleService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async filterUsers(filters: FilterUserDto): Promise<PaginatedResponse<User>> {
    return this.observabilityService.withSpan(USER_FILTERS_SPAN_NAMES.FILTER_USERS, async span => {
      try {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;

        const cacheKey = this.buildCacheKey(filters);
        const cachedData = await this.cacheManager.get<PaginatedResponse<User>>(cacheKey);

        if (cachedData) {
          span.setAttribute(USER_FILTERS_SPAN_ATTRIBUTES.PAGE, cachedData.page);
          span.setAttribute(USER_FILTERS_SPAN_ATTRIBUTES.TOTAL, cachedData.total);
          return cachedData;
        }

        const query = this.userRepository.createQueryBuilder('user');
        this.buildQuery(query, filters);

        const [users, total] = await query
          .orderBy('user.createdAt', 'DESC')
          .skip((page - 1) * limit)
          .take(limit)
          .getManyAndCount();

        const totalPages = Math.ceil(total / limit);
        const response: PaginatedResponse<User> = {
          items: users,
          total,
          page,
          totalPages,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        };

        await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);

        span.setAttribute(USER_FILTERS_SPAN_ATTRIBUTES.PAGE, response.page);
        span.setAttribute(USER_FILTERS_SPAN_ATTRIBUTES.TOTAL, response.total);

        return response;
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `filterUsers failed: ${message}`,
          error instanceof Error ? error.stack : undefined,
          UserFiltersService.name,
        );
        throw new InternalServerErrorException('Failed to filter users');
      }
    });
  }

  /**
   * Lists users belonging to a business (owner profile or cashiers of stores under the business).
   * Scope: {@link SystemRole.BUSINESS_OWNER} and {@link SystemRole.CASHIER} resolve tenant from profile;
   * {@link SystemRole.ADMIN} / {@link SystemRole.MANAGER} must pass `businessProfileId` in query.
   */
  async filterUsersByBusiness(
    filters: FilterBusinessUsersDto,
    userId: string,
  ): Promise<PaginatedResponse<User>> {
    return this.observabilityService.withSpan(
      USER_FILTERS_SPAN_NAMES.FILTER_BY_BUSINESS,
      async span => {
        const businessProfileId = await this.resolveBusinessProfileIdForBusinessUsersList(
          userId,
          filters.businessProfileId,
        );

        const query = this.createBusinessUsersListQuery(businessProfileId);
        this.applyBusinessUserSearchFilters(query, filters);

        const total = await query.clone().getCount();

        PaginationCacheUtil.applyPagination(query, filters, {
          aliasOverride: 'user',
          columnMap: BUSINESS_USER_SORT_COLUMN_MAP,
        });

        const items = await query.getMany();
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;

        const result = PaginationCacheUtil.createPaginatedResponse({
          items,
          total,
          page,
          limit,
        });

        span.setAttribute(USER_FILTERS_SPAN_ATTRIBUTES.PAGE, result.page);
        span.setAttribute(USER_FILTERS_SPAN_ATTRIBUTES.TOTAL, result.total);

        return result;
      },
    );
  }

  private buildCacheKey(filters: FilterUserDto): string {
    const orderedFilters = Object.keys(filters)
      .sort((a, b) => a.localeCompare(b))
      .reduce(
        (obj, key) => {
          obj[key] = filters[key];
          return obj;
        },
        {} as Record<string, unknown>,
      );

    return `${this.CACHE_PREFIX}${createHash('sha256')
      .update(JSON.stringify(orderedFilters))
      .digest('hex')}`;
  }

  private buildQuery(query: SelectQueryBuilder<User>, filters: FilterUserDto) {
    query
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.deletedAt IS NULL');

    if (filters.name) {
      const namePattern = `%${this.escapeLikeString(filters.name)}%`;
      query.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:namePattern) OR LOWER(user.lastName) LIKE LOWER(:namePattern))',
        { namePattern },
      );
    }

    if (filters.email) {
      query.andWhere('LOWER(user.email) LIKE LOWER(:email)', {
        email: `%${this.escapeLikeString(filters.email)}%`,
      });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isOnline) {
      const onlineThreshold = new Date(Date.now() - 5 * 60 * 1000);
      query.andWhere('user.lastLogin > :onlineThreshold', {
        onlineThreshold,
      });
    }

    if (filters.isPendingApproval) {
      query.andWhere('user.isActive = :isActive', { isActive: false });
    }

    if (filters.roles?.length) {
      query.andWhere('role.name IN (:...roleNames)', {
        roleNames: filters.roles,
      });
    }

    return query;
  }

  private escapeLikeString(value: string): string {
    return value.replaceAll(/[%_\\]/g, match => String.raw`\\` + match);
  }

  private createBusinessUsersListQuery(businessProfileId: string): SelectQueryBuilder<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.profile', 'profile')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.deletedAt IS NULL')
      .andWhere(
        new Brackets(w => {
          w.where('profile.profileType = :ownerRole AND profile.profileId = :bpId', {
            ownerRole: SystemRole.BUSINESS_OWNER,
            bpId: businessProfileId,
          }).orWhere(
            new Brackets(w2 => {
              w2.where('profile.profileType = :cashierRole', {
                cashierRole: SystemRole.CASHIER,
              }).andWhere(
                `EXISTS (
                  SELECT 1 FROM cashier_profiles cp
                  INNER JOIN store s ON s.id = cp.store_id
                  WHERE cp.id = "profile"."profile_id" AND s.business_profile_id = :bpId
                )`,
                { bpId: businessProfileId },
              );
            }),
          );
        }),
      );
  }

  private applyBusinessUserSearchFilters(
    query: SelectQueryBuilder<User>,
    filters: FilterBusinessUsersDto,
  ): void {
    if (filters.name) {
      const namePattern = `%${this.escapeLikeString(filters.name)}%`;
      query.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:namePattern) OR LOWER(user.lastName) LIKE LOWER(:namePattern))',
        { namePattern },
      );
    }

    if (filters.email) {
      query.andWhere('LOWER(user.email) LIKE LOWER(:email)', {
        email: `%${this.escapeLikeString(filters.email)}%`,
      });
    }

    if (filters.roles?.length) {
      query.andWhere('role.name IN (:...roleNames)', {
        roleNames: filters.roles,
      });
    }
  }

  private async resolveBusinessProfileIdForBusinessUsersList(
    userId: string,
    queryBusinessProfileId: string | undefined,
  ): Promise<string> {
    const role = await this.getUserRoleForListing(userId);
    if (!role) {
      throw new ForbiddenException('User has no assigned role');
    }

    if (role === SystemRole.BUSINESS_OWNER) {
      const profile = await this.userProfileService.getUserProfile(userId);
      if (profile?.profileType === SystemRole.BUSINESS_OWNER && profile.profileId) {
        return profile.profileId;
      }
      this.logger.warn('Business user list: invalid business owner profile', { userId });
      throw new ForbiddenException('Invalid business owner profile');
    }

    if (role === SystemRole.CASHIER) {
      return this.resolveCashierBusinessProfileIdForListing(userId);
    }

    if (role === SystemRole.ADMIN || role === SystemRole.MANAGER) {
      if (!queryBusinessProfileId) {
        throw new BadRequestException(
          'businessProfileId is required when listing business users as admin or manager',
        );
      }
      return queryBusinessProfileId;
    }

    throw new ForbiddenException('Insufficient permissions to list business users');
  }

  private async getUserRoleForListing(userId: string): Promise<SystemRole | null> {
    const role = await this.roleService.findRoleByUserId(userId);
    return role?.name ?? null;
  }

  private async resolveCashierBusinessProfileIdForListing(userId: string): Promise<string> {
    const profile = await this.userProfileService.getUserProfile(userId);
    if (!profile?.profileId || profile.profileType !== SystemRole.CASHIER) {
      this.logger.warn('Business user list: invalid cashier profile', { userId });
      throw new ForbiddenException('Invalid cashier profile');
    }
    const cashier = await this.cashierProfileRepository.findOne({
      where: { id: profile.profileId },
      relations: ['store'],
    });
    if (!cashier?.store?.businessProfileId) {
      this.logger.warn('Business user list: cashier without store assignment', {
        userId,
        cashierId: profile.profileId,
      });
      throw new ForbiddenException('Cashier must be assigned to a store');
    }
    return cashier.store.businessProfileId;
  }
}
