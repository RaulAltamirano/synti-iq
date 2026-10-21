import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { StoreSchedule } from './entities/store-schedule.entity';
import { CreateStoreScheduleDto } from './dto/create-store-schedule.dto';
import { UpdateStoreScheduleDto } from './dto/update-store-schedule.dto';
import { StoreScheduleRepository } from './repositories/store-schedule.repository';
import { StoreQueryService } from 'src/store/services/store-query.service';

@Injectable()
export class StoreScheduleService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_PREFIX = 'store_schedule:';

  constructor(
    private readonly storeScheduleRepository: StoreScheduleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly storeQueryService: StoreQueryService,
  ) {}

  private getCacheKey(id: string): string {
    return `${this.CACHE_PREFIX}${id}`;
  }

  async create(createDto: CreateStoreScheduleDto): Promise<StoreSchedule> {
    const schedule = await this.storeScheduleRepository.create(createDto);
    await this.cacheManager.set(this.getCacheKey(schedule.id), schedule, this.CACHE_TTL);
    return schedule;
  }

  async findOne(id: string, userId: string): Promise<StoreSchedule> {
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cacheManager.get<StoreSchedule>(cacheKey);

    if (cached) {
      await this.storeQueryService.findOne(cached.storeId, userId);
      return cached;
    }

    const schedule = await this.storeScheduleRepository.findById(id);
    await this.storeQueryService.findOne(schedule.storeId, userId);
    await this.cacheManager.set(cacheKey, schedule, this.CACHE_TTL);
    return schedule;
  }

  async update(
    id: string,
    updateDto: UpdateStoreScheduleDto,
    userId: string,
  ): Promise<StoreSchedule> {
    const existing = await this.storeScheduleRepository.findById(id);
    await this.storeQueryService.findOne(existing.storeId, userId);
    const fields = { ...updateDto };
    delete fields.storeId;
    const schedule = await this.storeScheduleRepository.update(id, fields);
    await this.cacheManager.set(this.getCacheKey(id), schedule, this.CACHE_TTL);
    return schedule;
  }

  async remove(id: string, userId: string): Promise<StoreSchedule> {
    const existing = await this.storeScheduleRepository.findById(id);
    await this.storeQueryService.findOne(existing.storeId, userId);
    const schedule = await this.storeScheduleRepository.delete(id);
    await this.cacheManager.del(this.getCacheKey(id));
    return schedule;
  }

  async toggleActive(id: string, userId: string): Promise<StoreSchedule> {
    const existing = await this.storeScheduleRepository.findById(id);
    await this.storeQueryService.findOne(existing.storeId, userId);
    const schedule = await this.storeScheduleRepository.toggleActive(id);
    await this.cacheManager.set(this.getCacheKey(id), schedule, this.CACHE_TTL);
    return schedule;
  }

  async findByStoreId(storeId: string): Promise<StoreSchedule[]> {
    return this.storeScheduleRepository.findByStoreId(storeId);
  }
}
