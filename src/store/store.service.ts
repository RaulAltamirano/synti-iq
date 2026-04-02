import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { User } from 'src/user/entities/user.entity';
import { In, Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { StoreFilterDto } from './dto/filter-store-dto';
import { FilterStoreCashiersDto } from './dto/filter-store-cashiers.dto';
import { CreateCashierAccountDto } from './dto/create-cashier-account.dto';
import { CreateCashierAccountResponseDto } from './dto/create-cashier-account-response.dto';
import { CreateUnassignedCashierAccountDto } from 'src/cashier-profile/dto/create-unassigned-cashier-account.dto';
import { AccountInvitationService } from 'src/auth/services/account-invitation.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Location } from 'src/location/entities/location.entity';
import { LocationService } from 'src/location/location.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { UserService } from 'src/user/user.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { DateUtils } from 'src/shared/utils/date-utils';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { STORE_SPAN_ATTRIBUTES, STORE_SPAN_NAMES } from './constants/store-span.constants';

/** Maps API sort field names to TypeORM `store` alias columns */
const STORE_SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'createdAt',
  name: 'name',
  isActive: 'isActive',
  dailySalesTarget: 'dailySalesTarget',
  updatedAt: 'updatedAt',
};

/** Maps API sort field names to TypeORM `cashier` alias columns */
const CASHIER_SORT_COLUMN_MAP: Record<string, string> = {
  id: 'id',
  cashierNumber: 'cashierNumber',
  branchOffice: 'branchOffice',
  lastActivityAt: 'lastActivityAt',
  isApproved: 'isApproved',
};

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private readonly CACHE_PREFIX = 'store';
  private readonly CACHE_VERSION_KEY = 'store:_version';

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(CashierProfile)
    private readonly cashierRepo: Repository<CashierProfile>,
    private readonly locationService: LocationService,
    private readonly userProfileService: UserProfileService,
    private readonly userService: UserService,
    private readonly accountInvitationService: AccountInvitationService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly observabilityService: ObservabilityService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(filters: StoreFilterDto, userId?: string): Promise<PaginatedResponse<Store>> {
    return this.observabilityService.withSpan(STORE_SPAN_NAMES.FIND_ALL, async span => {
      if (userId) {
        await this.applyStoreScopeForUser(userId, filters);
      }

      const version = (await this.cacheManager.get<number>(this.CACHE_VERSION_KEY)) ?? 0;
      const hashPart = PaginationCacheUtil.buildCacheKey(this.CACHE_PREFIX, filters).split(':')[1];
      const cacheKey = `${this.CACHE_PREFIX}:${version}:${hashPart}`;

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

      const countQueryBuilder = queryBuilder.clone();
      const total = await countQueryBuilder.getCount();

      PaginationCacheUtil.applyPagination(queryBuilder, filters, {
        columnMap: STORE_SORT_COLUMN_MAP,
      });

      const stores = await queryBuilder.getMany();

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;

      const response = PaginationCacheUtil.createPaginatedResponse({
        items: stores,
        total,
        page,
        limit,
      });

      span.setAttribute(STORE_SPAN_ATTRIBUTES.PAGE, response.page);
      span.setAttribute(STORE_SPAN_ATTRIBUTES.LIMIT, response.limit);
      span.setAttribute(STORE_SPAN_ATTRIBUTES.TOTAL, response.total);

      await this.cacheManager.set(cacheKey, response, 300);

      return response;
    });
  }

  /**
   * Restricts listing to the caller's business (owner) or the cashier's business profile.
   */
  private async applyStoreScopeForUser(userId: string, filters: StoreFilterDto): Promise<void> {
    const role = await this.userService.getUserRole(userId);
    if (role === SystemRole.BUSINESS_OWNER) {
      const profile = await this.userProfileService.getUserProfile(userId);
      if (profile?.profileId && profile?.profileType === SystemRole.BUSINESS_OWNER) {
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
      this.logger.warn('Store scope: invalid cashier profile for user', { userId });
      throw new ForbiddenException('Invalid cashier profile');
    }
    const cashier = await this.cashierRepo.findOne({
      where: { id: profile.profileId },
      relations: ['store'],
    });
    if (!cashier?.store?.businessProfileId) {
      this.logger.warn('Store scope: cashier without store assignment', {
        userId,
        cashierId: profile.profileId,
      });
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
      queryBuilder.andWhere('store.name LIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('store.isActive = :isActive', {
        isActive: filters.isActive,
      });
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

  /**
   * Ensures the caller may view this store (same rules as {@link findOne}).
   * When `userId` is omitted, no check is performed.
   */
  private async assertUserCanViewStore(store: Store, userId?: string): Promise<void> {
    if (!userId) {
      return;
    }

    const role = await this.userService.getUserRole(userId);
    if (role === SystemRole.BUSINESS_OWNER && store.businessProfileId) {
      const profile = await this.userProfileService.getUserProfile(userId);
      if (
        !profile?.profileId ||
        profile.profileType !== SystemRole.BUSINESS_OWNER ||
        profile.profileId !== store.businessProfileId
      ) {
        this.logger.warn('Store access denied: business owner mismatch', {
          storeId: store.id,
          userId,
        });
        throw new ForbiddenException('You can only access your own stores');
      }
    } else if (role === SystemRole.CASHIER) {
      const businessProfileId = await this.resolveCashierBusinessProfileId(userId);
      if (store.businessProfileId !== businessProfileId) {
        this.logger.warn('Store access denied: cashier business mismatch', {
          storeId: store.id,
          userId,
        });
        throw new ForbiddenException('You can only access stores in your business');
      }
    } else {
      this.logger.warn('Store access denied: role not permitted for store access', {
        storeId: store.id,
        userId,
        role,
      });
      throw new ForbiddenException('You are not allowed to access this store');
    }
  }

  async getCashiersFromStorePaginated(
    storeId: string,
    filters: FilterStoreCashiersDto,
    userId?: string,
  ): Promise<PaginatedResponse<CashierProfile>> {
    return this.observabilityService.withSpan(STORE_SPAN_NAMES.FIND_STORE_CASHIERS, async span => {
      span.setAttribute(STORE_SPAN_ATTRIBUTES.STORE_ID, storeId);

      const store = await this.storeRepo.findOne({ where: { id: storeId } });
      if (!store) {
        throw new NotFoundException(`Store with id ${storeId} not found`);
      }

      await this.assertUserCanViewStore(store, userId);

      const queryBuilder = this.cashierRepo
        .createQueryBuilder('cashier')
        .leftJoin(
          UserProfile,
          'up',
          'up.profile_id = cashier.id AND up.profile_type = :profileType',
          { profileType: SystemRole.CASHIER },
        )
        .leftJoinAndMapOne('cashier.user', User, 'u', 'u.id = up."userId"')
        .where('cashier.storeId = :storeId', { storeId });

      const countQueryBuilder = queryBuilder.clone();
      const total = await countQueryBuilder.getCount();

      PaginationCacheUtil.applyPagination(queryBuilder, filters, {
        columnMap: CASHIER_SORT_COLUMN_MAP,
        aliasOverride: 'cashier',
      });

      const items = await queryBuilder.getMany();

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;

      const response = PaginationCacheUtil.createPaginatedResponse({
        items,
        total,
        page,
        limit,
      });

      span.setAttribute(STORE_SPAN_ATTRIBUTES.PAGE, response.page);
      span.setAttribute(STORE_SPAN_ATTRIBUTES.LIMIT, response.limit);
      span.setAttribute(STORE_SPAN_ATTRIBUTES.TOTAL, response.total);

      return response;
    });
  }

  async create(input: CreateStoreDto, userId: string): Promise<Store> {
    try {
      const { name, location: locationInput, schedules: scheduleItems } = input;

      const profile = await this.userProfileService.getUserProfile(userId);
      if (!profile?.profileId || profile.profileType !== SystemRole.BUSINESS_OWNER) {
        throw new ForbiddenException('Only business owners can create stores');
      }

      const businessProfileId = profile.profileId;

      const existingStore = await this.storeRepo.findOne({
        where: { name, businessProfileId },
      });
      if (existingStore) {
        throw new ConflictException('A store with this name already exists');
      }

      let location: Location | null = null;
      if (locationInput) {
        location = await this.locationService.createLocation(locationInput);
      }

      const { schedules: _s, ...storeInput } = input;
      const scheduleRows = scheduleItems?.length ? scheduleItems : null;

      if (scheduleRows) {
        const saved = await this.storeRepo.manager.transaction(async tx => {
          const store = this.storeRepo.create({
            ...storeInput,
            location,
            businessProfileId,
            isActive: input.isActive ?? true,
          });
          store.schedules = scheduleRows.map(item => {
            const schedule = new StoreSchedule();
            schedule.name = item.name ?? item.dayOfWeek;
            schedule.description = item.description;
            schedule.dayOfWeek = item.dayOfWeek;
            schedule.openTime = DateUtils.normalizeTimeStringForPg(item.openTime);
            schedule.closeTime = DateUtils.normalizeTimeStringForPg(item.closeTime);
            schedule.store = store;
            schedule.isActive = true;
            return schedule;
          });
          return tx.getRepository(Store).save(store);
        });
        await this.invalidateListCache();
        const withSchedules = await this.storeRepo.findOne({
          where: { id: saved.id },
          relations: ['schedules'],
        });
        return withSchedules ?? saved;
      }

      const store = this.storeRepo.create({
        ...storeInput,
        location,
        businessProfileId,
        isActive: input.isActive ?? true,
      });

      const saved = await this.storeRepo.save(store);
      await this.invalidateListCache();
      return saved;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create store');
    }
  }

  private async invalidateListCache(): Promise<void> {
    await this.cacheManager.set(this.CACHE_VERSION_KEY, Date.now(), 86400);
  }

  async remove(id: string, userId?: string): Promise<void> {
    await this.findOne(id, userId);

    try {
      await this.storeRepo.delete(id);
      await this.invalidateListCache();
    } catch (error) {
      this.logger.error(
        'Error deleting store',
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadRequestException('Error deleting store');
    }
  }

  /**
   * Creates a new user with role CASHIER and a cashier profile for this store.
   * Authorization: caller must own the store (enforced via {@link findOne}).
   */
  async createCashierUserForStore(
    storeId: string,
    dto: CreateCashierAccountDto,
    ownerUserId: string,
  ): Promise<CreateCashierAccountResponseDto> {
    const store = await this.findOne(storeId, ownerUserId);

    const createUserDto: CreateUserDto = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: SystemRole.CASHIER,
      actingBusinessProfileId: store.businessProfileId,
      pendingPasswordSetup: true,
      profileData: {
        storeId,
        branchOffice: dto.branchOffice,
        cashierNumber: dto.cashierNumber,
        shiftStartTime: dto.shiftStartTime,
        shiftEndTime: dto.shiftEndTime,
      },
    };

    const user = await this.userService.create(createUserDto);

    const ttlHours = Number(this.configService.get<string>('CASHIER_INVITATION_TTL_HOURS') ?? 48);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    const { rawToken } = await this.accountInvitationService.createForUser(user.id, expiresAt);
    const appUrl = (
      this.configService.get<string>('FRONTEND_URL') ?? 'https://app.syntiiq.com'
    ).replace(/\/$/, '');
    const setPasswordUrl = `${appUrl}/auth/set-password?token=${encodeURIComponent(rawToken)}`;

    await this.mailService.sendCashierInvitation({
      email: user.email,
      firstName: user.firstName,
      setPasswordUrl,
    });

    await this.invalidateListCache();
    return { user, invitationSent: true };
  }

  async assignCashierToStore(
    storeId: string,
    cashierId: string,
    userId?: string,
  ): Promise<boolean> {
    const store = await this.findOne(storeId, userId);
    const cashier = await this.cashierRepo.findOne({
      where: { id: cashierId },
    });

    if (!cashier) {
      throw new NotFoundException('Cashier not found');
    }

    if (cashier.businessProfileId !== store.businessProfileId) {
      throw new ForbiddenException('Cashier does not belong to this business');
    }

    cashier.store = store;
    cashier.storeId = store.id;
    await this.cashierRepo.save(cashier);
    return true;
  }

  /**
   * Creates a new user with role CASHIER without assigning them to a specific store.
   * The cashier can be assigned to a store later via {@link assignCashierToStore}.
   * Authorization: caller must be a BUSINESS_OWNER; businessProfileId is resolved from their profile.
   */
  async createUnassignedCashierForBusiness(
    dto: CreateUnassignedCashierAccountDto,
    ownerUserId: string,
  ): Promise<CreateCashierAccountResponseDto> {
    const profile = await this.userProfileService.getUserProfile(ownerUserId);
    if (!profile?.profileId || profile.profileType !== SystemRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can create cashier accounts');
    }

    const createUserDto: CreateUserDto = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: SystemRole.CASHIER,
      actingBusinessProfileId: profile.profileId,
      pendingPasswordSetup: true,
      profileData: {
        branchOffice: dto.branchOffice,
        cashierNumber: dto.cashierNumber,
        shiftStartTime: dto.shiftStartTime,
        shiftEndTime: dto.shiftEndTime,
      },
    };

    const user = await this.userService.create(createUserDto);

    const ttlHours = Number(this.configService.get<string>('CASHIER_INVITATION_TTL_HOURS') ?? 48);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    const { rawToken } = await this.accountInvitationService.createForUser(user.id, expiresAt);
    const appUrl = (
      this.configService.get<string>('FRONTEND_URL') ?? 'https://app.syntiiq.com'
    ).replace(/\/$/, '');
    const setPasswordUrl = `${appUrl}/auth/set-password?token=${encodeURIComponent(rawToken)}`;

    await this.mailService.sendCashierInvitation({
      email: user.email,
      firstName: user.firstName,
      setPasswordUrl,
    });

    return { user, invitationSent: true };
  }

  /**
   * Soft-deletes cashier profiles that belong to this store (removes them from the store listing).
   */
  async removeCashiersFromStore(
    storeId: string,
    cashierIds: string[],
    userId?: string,
  ): Promise<{ removed: number }> {
    await this.findOne(storeId, userId);
    if (cashierIds.length === 0) {
      return { removed: 0 };
    }
    const uniqueIds = [...new Set(cashierIds)];
    const result = await this.cashierRepo.softDelete({
      id: In(uniqueIds),
      storeId,
    });
    await this.invalidateListCache();
    return { removed: result.affected ?? 0 };
  }

  public async validateStore(storeId: string): Promise<Store> {
    if (!storeId) {
      throw new BadRequestException('Store ID is required');
    }

    const store = await this.storeRepo.findOne({ where: { id: storeId } });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    return store;
  }
}
