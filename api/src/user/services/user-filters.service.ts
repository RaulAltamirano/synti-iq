import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { User } from '../entities/user.entity';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { FilterBusinessUsersDto } from '../dto/filter-business-users.dto';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
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

const ADMIN_USER_SORT_COLUMN_MAP: Record<string, string> = {
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

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CashierProfile)
    private readonly cashierProfileRepository: Repository<CashierProfile>,
    private readonly userProfileService: UserProfileService,
    private readonly roleService: RoleService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  /**
   * Paginated user listing for admin-style filters (name, email, role, activity flags).
   */
  async filterUsers(filters: FilterUserDto): Promise<PaginatedResponse<User>> {
    return this.observabilityService.withSpan(USER_FILTERS_SPAN_NAMES.FILTER_USERS, async span => {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.deletedAt IS NULL');

      this.applyFilterUserDtoClauses(query, filters);

      const total = await query.clone().getCount();

      PaginationCacheUtil.applyPagination(query, filters, {
        aliasOverride: 'user',
        columnMap: ADMIN_USER_SORT_COLUMN_MAP,
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

  private escapeLikeString(value: string): string {
    return value.replaceAll(/[%_\\]/g, match => String.raw`\\` + match);
  }

  private applyFilterUserDtoClauses(query: SelectQueryBuilder<User>, filters: FilterUserDto): void {
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
      query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.roles?.length) {
      query.andWhere('role.name IN (:...roleNames)', { roleNames: filters.roles });
    }

    if (filters.isOnline === true) {
      const threshold = new Date(Date.now() - 15 * 60 * 1000);
      query.andWhere('user.lastLogin IS NOT NULL AND user.lastLogin > :onlineSince', {
        onlineSince: threshold,
      });
    }

    if (filters.isPendingApproval === true) {
      query.andWhere(
        `EXISTS (
            SELECT 1 FROM user_profiles up
            INNER JOIN cashier_profiles cp ON cp.id = up.profile_id AND up.profile_type = :cashierRole
            WHERE up.user_id = user.id AND up.deleted_at IS NULL AND cp.is_approved = false
          )`,
        { cashierRole: SystemRole.CASHIER },
      );
    }
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
