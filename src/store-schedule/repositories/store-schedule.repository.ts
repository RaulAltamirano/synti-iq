import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSchedule } from '../entities/store-schedule.entity';
import { Store } from '../../store/entities/store.entity';
import { CreateStoreScheduleDto } from '../dto/create-store-schedule.dto';
import { UpdateStoreScheduleDto } from '../dto/update-store-schedule.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class StoreScheduleRepository {
  constructor(
    @InjectRepository(StoreSchedule)
    private readonly repository: Repository<StoreSchedule>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createDto: CreateStoreScheduleDto): Promise<StoreSchedule> {
    const store = await this.storeRepository.findOne({
      where: { id: createDto.storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${createDto.storeId} not found`);
    }

    const existingSchedule = await this.repository.findOne({
      where: {
        storeId: createDto.storeId,
        dayOfWeek: createDto.dayOfWeek,
      },
    });

    if (existingSchedule) {
      throw new Error(`A schedule already exists for ${createDto.dayOfWeek} for this store`);
    }

    const schedule = this.repository.create({
      ...createDto,
      store,
    });

    return this.repository.save(schedule);
  }

  async findById(id: string): Promise<StoreSchedule> {
    const schedule = await this.repository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!schedule) {
      throw new NotFoundException(`StoreSchedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(id: string, updateDto: UpdateStoreScheduleDto): Promise<StoreSchedule> {
    const schedule = await this.repository.preload({
      id,
      ...updateDto,
    });

    if (!schedule) {
      throw new NotFoundException(`StoreSchedule with ID ${id} not found`);
    }

    return this.repository.save(schedule);
  }

  async delete(id: string): Promise<StoreSchedule> {
    const schedule = await this.findById(id);
    schedule.isActive = false;
    return this.repository.save(schedule);
  }

  async toggleActive(id: string): Promise<StoreSchedule> {
    const schedule = await this.findById(id);
    schedule.isActive = !schedule.isActive;
    return this.repository.save(schedule);
  }

  async findByStoreId(storeId: string): Promise<StoreSchedule[]> {
    return this.repository.find({
      where: { storeId },
      relations: ['store'],
    });
  }
}
