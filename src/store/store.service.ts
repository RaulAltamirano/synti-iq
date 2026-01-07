import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
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

@Injectable()
export class StoreService {
  private readonly CACHE_PREFIX = 'store';
  private readonly logger = new Logger(StoreService.name);

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(CashierProfile)
    private readonly cashierRepo: Repository<CashierProfile>,
    private readonly locationService: LocationService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(filters: StoreFilterDto): Promise<PaginatedResponse<Store>> {
    const cacheKey = PaginationCacheUtil.buildCacheKey(this.CACHE_PREFIX, filters);

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
      data: stores,
      total,
      page: filters.page,
      limit: filters.limit,
    });

    await this.cacheManager.set(
      cacheKey,
      response,
      300, // 5 minutos
    );

    return response;
  }

  private applyFilters(queryBuilder: any, filters: StoreFilterDto): void {
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

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: ['schedules', 'cashiers', 'paymentMethods'],
    });

    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }

    return store;
  }

  async create(input: CreateStoreDto): Promise<Store> {
    try {
      const { name, location: locationInput } = input;

      const existingStore = await this.storeRepo.findOne({
        where: { name },
      });
      if (existingStore) {
        throw new ConflictException('Ya existe una tienda con este nombre');
      }

      let location: Location | undefined;
      if (locationInput) {
        location = await this.locationService.createOrFindLocation(locationInput);
      }

      const store = this.storeRepo.create({
        ...input,
        location,
        isActive: input.isActive ?? true,
      });

      return await this.storeRepo.save(store);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error al crear tienda: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo crear la tienda');
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    try {
      await this.storeRepo.delete(id);
    } catch (error) {
      throw new BadRequestException('Error deleting store', error);
    }
  }

  async assignCashierToStore(storeId: string, cashierId: string): Promise<boolean> {
    const store = await this.findOne(storeId);
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

  async getCashiersFromStore(storeId: string) {
    const store = await this.findOne(storeId);
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
