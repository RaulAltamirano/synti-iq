import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  EntityManager,
  FindOneOptions,
  SaveOptions,
  RemoveOptions,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';
import { CashierScheduleAssignment } from '../entities/cashier-schedule-assignment.entity';
import { AssignmentStatus } from '../enums/assignment-status.dto';
import { AssignmentFilterDto } from '../dto/assignment-filter.dto';

@Injectable()
export class CashierScheduleAssignmentRepository {
  constructor(
    @InjectRepository(CashierScheduleAssignment)
    private readonly repository: Repository<CashierScheduleAssignment>,
    private readonly entityManager: EntityManager,
  ) {}

  async findById(id: string): Promise<CashierScheduleAssignment | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByStatusAndId(
    id: string,
    status: AssignmentStatus,
  ): Promise<CashierScheduleAssignment | null> {
    return this.repository.findOne({ where: { id, status } });
  }

  async findCashierAssignments(
    cashierId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CashierScheduleAssignment[]> {
    return this.repository.find({
      where: {
        cashierId,
        timeBlock: {
          startTime: startDate,
          endTime: endDate,
        },
      },
    });
  }

  async findOverlappingAssignments(
    cashierId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<number> {
    const queryBuilder = this.repository
      .createQueryBuilder('assignment')
      .where('assignment.cashierId = :cashierId', { cashierId })
      .andWhere('(assignment.startTime <= :endTime AND assignment.endTime >= :startTime)', {
        startTime,
        endTime,
      });

    if (excludeId) {
      queryBuilder.andWhere('assignment.id != :excludeId', { excludeId });
    }

    return queryBuilder.getCount();
  }

  async findAllWithFilters(
    filters: AssignmentFilterDto,
  ): Promise<[CashierScheduleAssignment[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.timeBlock', 'timeBlock')
      .leftJoinAndSelect('assignment.cashier', 'cashier');

    this.applyFilters(queryBuilder, filters);

    return queryBuilder.getManyAndCount();
  }

  async updateStatus(
    id: string,
    status: AssignmentStatus,
    swapRequestedWithId?: string,
    reason?: string,
  ): Promise<void> {
    await this.repository.update(id, {
      status,
      swapRequestedWithId,
      reason,
    });
  }

  private applyFilters(queryBuilder: any, filters: AssignmentFilterDto): void {
    const { cashierId, storeId, status, startDate, endDate, timeBlockId, recurringTemplateId } =
      filters;

    if (cashierId) {
      queryBuilder.andWhere('assignment.cashierId = :cashierId', { cashierId });
    }

    if (storeId) {
      queryBuilder.andWhere('timeBlock.storeId = :storeId', { storeId });
    }

    if (status) {
      queryBuilder.andWhere('assignment.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('timeBlock.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('timeBlock.endTime <= :endDate', { endDate });
    }

    if (timeBlockId) {
      queryBuilder.andWhere('assignment.timeBlockId = :timeBlockId', {
        timeBlockId,
      });
    }

    if (recurringTemplateId) {
      queryBuilder.andWhere('assignment.recurringTemplateId = :recurringTemplateId', {
        recurringTemplateId,
      });
    }
  }

  async save(entity: CashierScheduleAssignment): Promise<CashierScheduleAssignment> {
    return this.repository.save(entity);
  }

  async findOne(
    options: FindOneOptions<CashierScheduleAssignment>,
  ): Promise<CashierScheduleAssignment> {
    return this.repository.findOne(options);
  }

  async remove(entity: CashierScheduleAssignment): Promise<CashierScheduleAssignment> {
    return this.repository.remove(entity);
  }

  async removeMany(entities: CashierScheduleAssignment[]): Promise<CashierScheduleAssignment[]> {
    return this.repository.remove(entities);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async findByStore(
    storeId: string,
    filters: AssignmentFilterDto,
  ): Promise<[CashierScheduleAssignment[], number]> {
    const query = this.repository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.timeBlock', 'timeBlock')
      .where('timeBlock.storeId = :storeId', { storeId });

    if (filters.status) {
      query.andWhere('assignment.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('timeBlock.startTime >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('timeBlock.endTime <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();
  }

  async findByStatus(
    status: AssignmentStatus,
    filters: AssignmentFilterDto,
  ): Promise<[CashierScheduleAssignment[], number]> {
    const query = this.repository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.timeBlock', 'timeBlock')
      .where('assignment.status = :status', { status });

    if (filters.storeId) {
      query.andWhere('timeBlock.storeId = :storeId', {
        storeId: filters.storeId,
      });
    }

    if (filters.startDate) {
      query.andWhere('timeBlock.startTime >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('timeBlock.endTime <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    filters: AssignmentFilterDto,
  ): Promise<[CashierScheduleAssignment[], number]> {
    const query = this.repository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.timeBlock', 'timeBlock')
      .where('timeBlock.startTime >= :startDate', { startDate })
      .andWhere('timeBlock.endTime <= :endDate', { endDate });

    if (filters.storeId) {
      query.andWhere('timeBlock.storeId = :storeId', {
        storeId: filters.storeId,
      });
    }

    if (filters.status) {
      query.andWhere('assignment.status = :status', { status: filters.status });
    }

    return query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();
  }
}
