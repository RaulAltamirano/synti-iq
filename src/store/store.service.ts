import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { StoreFilterDto } from './dto/filter-store-dto';
import { Location } from 'src/location/entities/location.entity';
import { LocationService } from 'src/location/location.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { UserService } from 'src/user/user.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { DateUtils } from 'src/shared/utils/date-utils';

@Injectable()
export class StoreService {
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(filters: StoreFilterDto, userId?: string): Promise<PaginatedResponse<Store>> {
    if (userId) {
      const role = await this.userService.getUserRole(userId);
      if (role === SystemRole.BUSINESS_OWNER) {
        const profile = await this.userProfileService.getUserProfile(userId);
        if (profile?.profileId && profile?.profileType === SystemRole.BUSINESS_OWNER) {
          filters.businessProfileId = profile.profileId;
        }
      }
    }

    const version = (await this.cacheManager.get<number>(this.CACHE_VERSION_KEY)) ?? 0;
    const hashPart = PaginationCacheUtil.buildCacheKey(this.CACHE_PREFIX, filters).split(':')[1];
    const cacheKey = `${this.CACHE_PREFIX}:${version}:${hashPart}`;

    const cachedResult = await this.cacheManager.get<PaginatedResponse<Store>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const queryBuilder = this.storeRepo
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.schedules', 'schedules')
      .leftJoinAndSelect('store.cashiers', 'cashiers')
      .leftJoinAndSelect('store.paymentMethods', 'paymentMethods');

    this.applyFilters(queryBuilder, filters);

    const countQueryBuilder = queryBuilder.clone();
    const total = await countQueryBuilder.getCount();

    PaginationCacheUtil.applyPagination(queryBuilder, filters);

    const stores = await queryBuilder.getMany();

    const response = PaginationCacheUtil.createPaginatedResponse({
      items: stores,
      total,
      page: filters.page,
      limit: filters.limit,
    });

    await this.cacheManager.set(cacheKey, response, 300);

    return response;
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
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: ['schedules', 'cashiers', 'paymentMethods'],
    });

    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }

    if (userId) {
      const role = await this.userService.getUserRole(userId);
      if (role === SystemRole.BUSINESS_OWNER && store.businessProfileId) {
        const profile = await this.userProfileService.getUserProfile(userId);
        if (
          !profile?.profileId ||
          profile.profileType !== SystemRole.BUSINESS_OWNER ||
          profile.profileId !== store.businessProfileId
        ) {
          throw new ForbiddenException('You can only access your own stores');
        }
      }
    }

    return store;
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
      const hasSchedules = scheduleItems && scheduleItems.length > 0;

      if (hasSchedules) {
        const saved = await this.storeRepo.manager.transaction(async tx => {
          const store = this.storeRepo.create({
            ...storeInput,
            location,
            businessProfileId,
            isActive: input.isActive ?? true,
          });
          store.schedules = scheduleItems!.map(item => {
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
      throw new BadRequestException('Error deleting store', error);
    }
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

    cashier.store = store;
    await this.cashierRepo.save(cashier);
    return true;
  }

  async getCashiersFromStore(storeId: string, userId?: string) {
    const store = await this.findOne(storeId, userId);
    return store.cashiers;
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
