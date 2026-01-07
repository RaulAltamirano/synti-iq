import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between, Not } from 'typeorm';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';
import { UserSession } from './entities/user-session.entity';
import { FindSessionDto } from './dto/find-session.dto';
import { FilterUserSessionDto } from './dto/filter-user-session.dto';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async findByUserAndSessionId(dto: FindSessionDto): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: {
        sessionId: dto.sessionId,
        userId: dto.userId,
        isValid: true,
      },
    });
  }

  async create(sessionData: CreateUserSessionDto): Promise<UserSession> {
    const createdSession = this.sessionRepository.create({
      ...sessionData,
      lastUsed: sessionData.lastUsed || new Date(),
      isValid: true,
    });
    return await this.sessionRepository.save(createdSession);
  }

  async update(
    userId: string,
    sessionId: string,
    updateData: UpdateUserSessionDto,
  ): Promise<number> {
    const result = await this.sessionRepository.update({ userId, sessionId }, updateData);
    return result.affected || 0;
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId, isValid: true },
    });
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.sessionRepository.delete({
      lastUsed: LessThan(date),
    });
    return result.affected || 0;
  }

  async invalidateAllForUser(userId: string): Promise<number> {
    const result = await this.sessionRepository.update(
      { userId, isValid: true },
      { isValid: false },
    );
    return result.affected || 0;
  }

  async findWithFilters(
    userId: string,
    filters: FilterUserSessionDto,
  ): Promise<[UserSession[], number]> {
    const query = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId });

    if (filters.isValid !== undefined) {
      query.andWhere('session.isValid = :isValid', {
        isValid: filters.isValid,
      });
    }

    if (filters.lastUsedAfter && filters.lastUsedBefore) {
      query.andWhere('session.lastUsed BETWEEN :start AND :end', {
        start: filters.lastUsedAfter,
        end: filters.lastUsedBefore,
      });
    } else if (filters.lastUsedAfter) {
      query.andWhere('session.lastUsed >= :start', {
        start: filters.lastUsedAfter,
      });
    } else if (filters.lastUsedBefore) {
      query.andWhere('session.lastUsed <= :end', {
        end: filters.lastUsedBefore,
      });
    }

    return query
      .orderBy('session.lastUsed', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();
  }

  async getActiveSessions(
    userId: string,
    filters: FilterUserSessionDto,
  ): Promise<[UserSession[], number]> {
    const query = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .andWhere('session.isValid = :isValid', { isValid: true });

    if (filters.lastUsedAfter && filters.lastUsedBefore) {
      query.andWhere('session.lastUsed BETWEEN :start AND :end', {
        start: filters.lastUsedAfter,
        end: filters.lastUsedBefore,
      });
    } else if (filters.lastUsedAfter) {
      query.andWhere('session.lastUsed >= :start', {
        start: filters.lastUsedAfter,
      });
    } else if (filters.lastUsedBefore) {
      query.andWhere('session.lastUsed <= :end', {
        end: filters.lastUsedBefore,
      });
    }

    return query
      .orderBy('session.lastUsed', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();
  }

  async findByDeviceType(userId: string, deviceType: string): Promise<UserSession[]> {
    return this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .andWhere('session.isValid = :isValid', { isValid: true })
      .andWhere('session.deviceInfo @> :deviceInfo', {
        deviceInfo: JSON.stringify({ deviceType }),
      })
      .getMany();
  }

  async invalidateByDeviceType(userId: string, deviceType: string): Promise<number> {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({ isValid: false })
      .where('userId = :userId', { userId })
      .andWhere('isValid = :isValid', { isValid: true })
      .andWhere('deviceInfo @> :deviceInfo', {
        deviceInfo: JSON.stringify({ deviceType }),
      })
      .execute();
    return result.affected || 0;
  }

  async invalidateAllExcept(userId: string, currentSessionId: string): Promise<number> {
    const result = await this.sessionRepository.update(
      {
        userId,
        isValid: true,
        sessionId: Not(currentSessionId),
      },
      { isValid: false },
    );
    return result.affected || 0;
  }
}
