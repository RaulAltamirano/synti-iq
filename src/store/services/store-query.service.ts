import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Span } from '@opentelemetry/api';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Store } from 'src/store/entities/store.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { UserService } from 'src/user/user.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { StoreFilterDto } from 'src/store/dto/filter-store-dto';
import {
  STORE_CACHE_PREFIX,
  STORE_CACHE_VERSION_KEY,
  STORE_LIST_CACHE_TTL_MS,
  STORE_VERSION_CACHE_TTL_MS,
  STORE_SPAN_ATTRIBUTES,
  STORE_SPAN_NAMES,
} from 'src/store/constants';

const STORE_SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'createdAt',
  name: 'name',
  isActive: 'isActive',
  dailySalesTarget: 'dailySalesTarget',
  updatedAt: 'updatedAt',
};

@Injectable()
export class StoreQueryService {
  private readonly logger = new Logger(StoreQueryService.name);

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(CashierProfile)
    private readonly cashierRepo: Repository<CashierProfile>,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly observabilityService: ObservabilityService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(filters: StoreFilterDto, userId?: string): Promise<PaginatedResponse<Store>> {
    return this.observabilityService.withSpan(STORE_SPAN_NAMES.FIND_ALL, async span => {
      if (userId) {
        await this.applyStoreScopeForUser(userId, filters);
      }

      const version = (await this.cacheManager.get<number>(STORE_CACHE_VERSION_KEY)) ?? 0;
      const hashPart = PaginationCacheUtil.buildCacheKey(STORE_CACHE_PREFIX, filters).split(':')[1];
      const cacheKey = `${STORE_CACHE_PREFIX}:${version}:${hashPart}`;

      const cachedResult = await this.cacheManager.get<PaginatedResponse<Store>>(cacheKey);
      if (cachedResult) {
        span.setAttribute(STORE_SPAN_ATTRIBUTES.PAGE, cachedResult.page);
        span.setAttribute(STORE_SPAN_ATTRIBUTES.LIMIT, cachedResult.limit);
        span.setAttribute(STORE_SPAN_ATTRIBUTES.TOTAL, cachedResult.total);
        return cachedResult;
      }

      const queryBuilder = this.storeRepo
        .createQueryBuilder('store')
        .leftJoinAndSelect('store.location', 'location')
        .leftJoinAndSelect('store.schedules', 'schedules')
        .leftJoinAndSelect('store.cashiers', 'cashiers')
        .leftJoinAndSelect('store.paymentMethods', 'paymentMethods');

      this.applyFilters(queryBuilder, filters);

      const response = await this.paginateQueryBuilder(queryBuilder, filters, {
        columnMap: STORE_SORT_COLUMN_MAP,
      });

      this.setPaginatedSpanAttributes(span, response);
      await this.cacheManager.set(cacheKey, response, STORE_LIST_CACHE_TTL_MS);

      return response;
    });
  }

  async findOne(id: string, userId?: string): Promise<Store> {
    return this.observabilityService.withSpan(STORE_SPAN_NAMES.FIND_ONE, async span => {
      span.setAttribute(STORE_SPAN_ATTRIBUTES.STORE_ID, id);

      const store = await this.storeRepo.findOne({
        where: { id },
        relations: ['schedules', 'cashiers', 'paymentMethods'],
      });

      if (!store) {
        throw new NotFoundException(`Store with id ${id} not found`);
      }

      await this.assertUserCanViewStore(store, userId);

      return store;
    });
  }

  public async validateStore(storeId: string): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }
    return store;
  }

  public async invalidateListCache(): Promise<void> {
    await this.cacheManager.set(STORE_CACHE_VERSION_KEY, Date.now(), STORE_VERSION_CACHE_TTL_MS);
  }

  private async applyStoreScopeForUser(userId: string, filters: StoreFilterDto): Promise<void> {
    const role = await this.userService.getUserRole(userId);
    if (role === SystemRole.BUSINESS_OWNER) {
      const profile = await this.userProfileService.getUserProfile(userId);
      if (profile?.profileId && profile.profileType === SystemRole.BUSINESS_OWNER) {
        filters.businessProfileId = profile.profileId;
      }
      return;
    }
    if (role === SystemRole.CASHIER) {
      filters.businessProfileId = await this.resolveCashierBusinessProfileId(userId);
    }
  }

  private async resolveCashierBusinessProfileId(userId: string): Promise<string> {
    const profile = await this.userProfileService.getUserProfile(userId);
    if (!profile?.profileId || profile.profileType !== SystemRole.CASHIER) {
      this.logger.warn(
        `Store scope: invalid cashier profile — userId=${userId}`,
        StoreQueryService.name,
      );
      throw new ForbiddenException('Invalid cashier profile');
    }
    const cashier = await this.cashierRepo.findOne({
      where: { id: profile.profileId },
      relations: ['store'],
    });
    if (!cashier?.store?.businessProfileId) {
      this.logger.warn(
        `Store scope: cashier without store assignment — userId=${userId} cashierId=${profile.profileId}`,
        StoreQueryService.name,
      );
      throw new ForbiddenException('Cashier must be assigned to a store');
    }
    return cashier.store.businessProfileId;
  }

  private applyFilters(
    queryBuilder: ReturnType<Repository<Store>['createQueryBuilder']>,
    filters: StoreFilterDto,
  ): void {
    if (filters.businessProfileId) {
      queryBuilder.andWhere('store.businessProfileId = :businessProfileId', {
        businessProfileId: filters.businessProfileId,
      });
    }
    if (filters.name) {
      queryBuilder.andWhere('store.name LIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('store.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.minDailySalesTarget !== undefined) {
      queryBuilder.andWhere('store.dailySalesTarget >= :minTarget', {
        minTarget: filters.minDailySalesTarget,
      });
    }
    if (filters.maxDailySalesTarget !== undefined) {
      queryBuilder.andWhere('store.dailySalesTarget <= :maxTarget', {
        maxTarget: filters.maxDailySalesTarget,
      });
    }
  }

  private async paginateQueryBuilder<T>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: BasePaginationParams,
    options: { columnMap: Record<string, string>; aliasOverride?: string },
  ): Promise<PaginatedResponse<T>> {
    const countQueryBuilder = queryBuilder.clone();
    const total = await countQueryBuilder.getCount();
    PaginationCacheUtil.applyPagination(queryBuilder, filters, {
      columnMap: options.columnMap,
      aliasOverride: options.aliasOverride,
    });
    const items = await queryBuilder.getMany();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    return PaginationCacheUtil.createPaginatedResponse({ items, total, page, limit });
  }

  private setPaginatedSpanAttributes(span: Span, response: PaginatedResponse<unknown>): void {
    span.setAttribute(STORE_SPAN_ATTRIBUTES.PAGE, response.page);
    span.setAttribute(STORE_SPAN_ATTRIBUTES.LIMIT, response.limit);
    span.setAttribute(STORE_SPAN_ATTRIBUTES.TOTAL, response.total);
  }

  private async assertUserCanViewStore(store: Store, userId?: string): Promise<void> {
    if (!userId) return;

    const role = await this.userService.getUserRole(userId);
    if (role === SystemRole.BUSINESS_OWNER && store.businessProfileId) {
      const profile = await this.userProfileService.getUserProfile(userId);
      if (
        !profile?.profileId ||
        profile.profileType !== SystemRole.BUSINESS_OWNER ||
        profile.profileId !== store.businessProfileId
      ) {
        this.logger.warn(
          `Store access denied: business owner mismatch — storeId=${store.id} userId=${userId}`,
          StoreQueryService.name,
        );
        throw new ForbiddenException('You can only access your own stores');
      }
    } else if (role === SystemRole.CASHIER) {
      const businessProfileId = await this.resolveCashierBusinessProfileId(userId);
      if (store.businessProfileId !== businessProfileId) {
        this.logger.warn(
          `Store access denied: cashier business mismatch — storeId=${store.id} userId=${userId}`,
          StoreQueryService.name,
        );
        throw new ForbiddenException('You can only access stores in your business');
      }
    } else {
      this.logger.warn(
        `Store access denied: role not permitted — storeId=${store.id} userId=${userId} role=${role}`,
        StoreQueryService.name,
      );
      throw new ForbiddenException('You are not allowed to access this store');
    }
  }
}
