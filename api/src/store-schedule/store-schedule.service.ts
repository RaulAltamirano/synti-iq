import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { StoreSchedule } from './entities/store-schedule.entity';
import { CreateStoreScheduleDto } from './dto/create-store-schedule.dto';
import { UpdateStoreScheduleDto } from './dto/update-store-schedule.dto';
import { StoreScheduleRepository } from './repositories/store-schedule.repository';

@Injectable()
export class StoreScheduleService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_PREFIX = 'store_schedule:';

  constructor(
    private readonly storeScheduleRepository: StoreScheduleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(id: string): string {
    return `${this.CACHE_PREFIX}${id}`;
  }

  async create(createDto: CreateStoreScheduleDto): Promise<StoreSchedule> {
    const schedule = await this.storeScheduleRepository.create(createDto);
    await this.cacheManager.set(this.getCacheKey(schedule.id), schedule, this.CACHE_TTL);
    return schedule;
  }

  async findOne(id: string): Promise<StoreSchedule> {
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cacheManager.get<StoreSchedule>(cacheKey);

    if (cached) {
      return cached;
    }

    const schedule = await this.storeScheduleRepository.findById(id);
    await this.cacheManager.set(cacheKey, schedule, this.CACHE_TTL);
    return schedule;
  }

  async update(id: string, updateDto: UpdateStoreScheduleDto): Promise<StoreSchedule> {
    const schedule = await this.storeScheduleRepository.update(id, updateDto);
    await this.cacheManager.set(this.getCacheKey(id), schedule, this.CACHE_TTL);
    return schedule;
  }

  async remove(id: string): Promise<StoreSchedule> {
    const schedule = await this.storeScheduleRepository.delete(id);
    await this.cacheManager.del(this.getCacheKey(id));
    return schedule;
  }

  async toggleActive(id: string): Promise<StoreSchedule> {
    const schedule = await this.storeScheduleRepository.toggleActive(id);
    await this.cacheManager.set(this.getCacheKey(id), schedule, this.CACHE_TTL);
    return schedule;
  }

  async findByStoreId(storeId: string): Promise<StoreSchedule[]> {
    return this.storeScheduleRepository.findByStoreId(storeId);
  }
}
