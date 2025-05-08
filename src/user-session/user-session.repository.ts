import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
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

  /**
   * Find a session by user ID and session ID
   * @param dto - Validated DTO containing userId and sessionId
   * @returns The session if found, null otherwise
   */
  async findByUserAndSessionId(
    dto: FindSessionDto,
  ): Promise<UserSession | null> {
    const session = await this.sessionRepository.findOne({
      where: {
        sessionId: dto.sessionId,
        userId: dto.userId,
        // sessionId: dto.sessionId,
      },
    });
    return session;
  }

  /**
   * Create a new user session
   * @param sessionData - Data for the new session
   * @returns The created session
   */
  async create(sessionData: CreateUserSessionDto): Promise<UserSession> {
    const createdSession = this.sessionRepository.create({
      ...sessionData,
      lastUsed: new Date(),
      isValid: true,
    });
    const session = await this.sessionRepository.save(createdSession);
    Logger.debug('Session ID about to be saved:', {session});
    return session;
  }

  /**
   * Update a user session
   * @param userId - The user's ID
   * @param sessionId - The session ID
   * @param updateData - Data to update
   * @returns Number of affected rows
   */
  async update(
    userId: string,
    sessionId: string,
    updateData: UpdateUserSessionDto,
  ): Promise<number> {
    const result = await this.sessionRepository.update(
      { userId, sessionId },
      updateData,
    );
    return result.affected || 0;
  }

  /**
   * Find all active sessions for a user
   * @param userId - The user's ID
   * @returns Array of active sessions
   */
  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId, isValid: true },
    });
  }

  /**
   * Delete sessions older than a specified date
   * @param date - Cut-off date
   * @returns Number of affected rows
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.sessionRepository.delete({
      lastUsed: LessThan(date),
    });
    return result.affected || 0;
  }

  /**
   * Invalidate all sessions for a user
   * @param userId - The user's ID
   * @returns Number of affected rows
   */
  async invalidateAllForUser(userId: string): Promise<number> {
    const result = await this.sessionRepository.update(
      { userId, isValid: true },
      { isValid: false },
    );
    return result.affected || 0;
  }

  /**
   * Find sessions with filtering and pagination
   * @param userId - The user's ID
   * @param filters - Filter criteria
   * @returns Array of sessions and total count
   */
  async findWithFilters(
    userId: string,
    filters: FilterUserSessionDto,
  ): Promise<[UserSession[], number]> {
    const query = this.sessionRepository.createQueryBuilder('session')
      .where('session.userId = :userId', { userId });

    if (filters.isValid !== undefined) {
      query.andWhere('session.isValid = :isValid', { isValid: filters.isValid });
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

  /**
   * Get active sessions for a user with pagination
   * @param userId - The user's ID
   * @param filters - Filter criteria
   * @returns Array of sessions and total count
   */
  async getActiveSessions(
    userId: string,
    filters: FilterUserSessionDto,
  ): Promise<[UserSession[], number]> {
    const query = this.sessionRepository.createQueryBuilder('session')
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
}
