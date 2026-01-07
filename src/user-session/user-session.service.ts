import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UserSessionResponseDto } from './dto/user-session-response.dto';
import { UserSessionRepository } from './user-session.repository';
import { RedisService } from 'src/shared/redis/redis.service';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { FilterUserSessionDto } from './dto/filter-user-session.dto';
import { DeviceInfoDto } from './dto/device-info.dto';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);
  private readonly SESSION_PREFIX = 'session';
  private readonly SESSION_TTL = 7 * 24 * 60 * 60;

  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly redisService: RedisService,
  ) {}

  async validateSessionOwnership(userId: string, sessionId: string): Promise<boolean> {
    this.validateParams(userId, sessionId);

    try {
      const sessionKey = this.getSessionKey(userId, sessionId);
      const sessionData = await this.redisService.get<{
        isValid: boolean;
        refreshTokenHash?: string;
      }>(sessionKey);

      if (sessionData !== null) {
        return sessionData.isValid === true;
      }

      const dbSession = await this.userSessionRepository.findByUserAndSessionId({
        userId,
        sessionId,
      });

      if (dbSession && dbSession.isValid) {
        await this.setSessionInRedisUnified(userId, sessionId, {
          refreshTokenHash: dbSession.refreshToken,
          isValid: dbSession.isValid,
          lastUsed: dbSession.lastUsed.toISOString(),
          deviceInfo: dbSession.deviceInfo,
        });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error validating session ownership: ${error.message}`, error.stack);
      throw this.handleError(error, 'validating session ownership');
    }
  }

  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    this.validateParams(userId, sessionId);

    try {
      const sessionKey = this.getSessionKey(userId, sessionId);
      await this.redisService.del(sessionKey);

      await this.userSessionRepository.update(userId, sessionId, {
        isValid: false,
      });
    } catch (error) {
      throw this.handleError(error, 'invalidating session');
    }
  }

  async createSession(dto: CreateUserSessionDto): Promise<UserSessionResponseDto> {
    this.ensureUserId(dto.userId);

    try {
      const saved = await this.userSessionRepository.create({
        ...dto,
        lastUsed: dto.lastUsed || new Date(),
      });

      return this.mapToResponseDto(saved);
    } catch (error) {
      throw this.handleError(error, 'creating user session');
    }
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    this.ensureUserId(userId);
    return this.userSessionRepository.findActiveByUserId(userId);
  }

  async invalidateAllSessions(userId: string): Promise<void> {
    this.ensureUserId(userId);

    try {
      const sessions = await this.userSessionRepository.findActiveByUserId(userId);

      if (sessions.length === 0) {
        return;
      }

      const sessionKeys = sessions.map(session => this.getSessionKey(userId, session.sessionId));
      if (sessionKeys.length > 0) {
        await this.redisService.del(...sessionKeys);
      }

      await this.userSessionRepository.invalidateAllForUser(userId);
    } catch (error) {
      throw this.handleError(error, 'invalidating all sessions');
    }
  }

  async getActiveSessions(
    userId: string,
    filters: FilterUserSessionDto,
  ): Promise<PaginatedResponse<UserSessionResponseDto>> {
    this.ensureUserId(userId);

    try {
      const [sessions, total] = await this.userSessionRepository.getActiveSessions(userId, filters);

      if (!sessions || sessions.length === 0) {
        return {
          data: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
          totalPages: 0,
        };
      }

      const mappedSessions = sessions.map(session => this.mapToResponseDto(session));
      return {
        data: mappedSessions,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      };
    } catch (error) {
      throw this.handleError(error, 'getting active sessions');
    }
  }

  async getActiveDevices(userId: string): Promise<
    {
      deviceType: string;
      count: number;
      lastUsed: Date;
      deviceInfo: DeviceInfoDto;
    }[]
  > {
    this.ensureUserId(userId);

    try {
      const sessions = await this.userSessionRepository.findActiveByUserId(userId);

      const deviceMap = new Map<
        string,
        {
          count: number;
          lastUsed: Date;
          deviceInfo: DeviceInfoDto;
        }
      >();

      sessions.forEach(session => {
        const deviceType = session.deviceInfo?.deviceType || 'unknown';
        const current = deviceMap.get(deviceType) || {
          count: 0,
          lastUsed: session.lastUsed,
          deviceInfo: session.deviceInfo,
        };

        deviceMap.set(deviceType, {
          count: current.count + 1,
          lastUsed: session.lastUsed > current.lastUsed ? session.lastUsed : current.lastUsed,
          deviceInfo: session.deviceInfo,
        });
      });

      return Array.from(deviceMap.entries()).map(([deviceType, data]) => ({
        deviceType,
        ...data,
      }));
    } catch (error) {
      throw this.handleError(error, 'getting active devices');
    }
  }

  async invalidateDeviceSessions(userId: string, deviceType: string): Promise<void> {
    this.ensureUserId(userId);
    if (!deviceType) {
      throw new BadRequestException('Device type is required');
    }

    try {
      const sessions = await this.userSessionRepository.findByDeviceType(userId, deviceType);

      if (sessions.length === 0) {
        return;
      }

      const sessionKeys = sessions.map(session => this.getSessionKey(userId, session.sessionId));
      if (sessionKeys.length > 0) {
        await this.redisService.del(...sessionKeys);
      }

      await this.userSessionRepository.invalidateByDeviceType(userId, deviceType);
    } catch (error) {
      throw this.handleError(error, 'invalidating device sessions');
    }
  }

  async invalidateOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    this.validateParams(userId, currentSessionId);

    try {
      const sessions = await this.userSessionRepository.findActiveByUserId(userId);
      const otherSessions = sessions.filter(session => session.sessionId !== currentSessionId);

      if (otherSessions.length === 0) {
        return;
      }

      const sessionKeys = otherSessions.map(session =>
        this.getSessionKey(userId, session.sessionId),
      );
      if (sessionKeys.length > 0) {
        await this.redisService.del(...sessionKeys);
      }

      await this.userSessionRepository.invalidateAllExcept(userId, currentSessionId);
    } catch (error) {
      throw this.handleError(error, 'invalidating other sessions');
    }
  }

  async updateSessionLastUsed(userId: string, sessionId: string): Promise<void> {
    this.validateParams(userId, sessionId);

    try {
      const affected = await this.userSessionRepository.update(userId, sessionId, {
        lastUsed: new Date(),
      });

      if (affected === 0) {
        throw new NotFoundException('Session not found');
      }

      const sessionKey = this.getSessionKey(userId, sessionId);
      const sessionData = await this.redisService.get<{
        refreshTokenHash: string;
        isValid: boolean;
        lastUsed?: string;
        deviceInfo?: any;
      }>(sessionKey);
      if (sessionData && sessionData.refreshTokenHash) {
        sessionData.lastUsed = new Date().toISOString();
        await this.setSessionInRedisUnified(userId, sessionId, sessionData);
      }
    } catch (error) {
      throw this.handleError(error, 'updating session last used');
    }
  }

  async cleanupExpiredSessions(expirationDays = 30): Promise<void> {
    try {
      const expiration = new Date(Date.now() - expirationDays * 24 * 60 * 60 * 1000);
      await this.userSessionRepository.deleteOlderThan(expiration);
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`, error.stack);
    }
  }

  private mapToResponseDto(session: UserSession): UserSessionResponseDto {
    return plainToInstance(UserSessionResponseDto, session, {
      excludeExtraneousValues: true,
    });
  }

  private validateParams(userId: string, sessionId: string): void {
    if (!userId || !sessionId) {
      throw new BadRequestException('User ID and Session ID are required');
    }
  }

  private ensureUserId(userId: string): void {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
  }

  private getSessionKey(userId: string, sessionId: string): string {
    return `${this.SESSION_PREFIX}:${userId}:${sessionId}`;
  }

  async setSessionInRedisUnified(
    userId: string,
    sessionId: string,
    data: {
      refreshTokenHash: string;
      isValid: boolean;
      lastUsed?: string;
      deviceInfo?: any;
      usedTokens?: string[];
    },
  ): Promise<void> {
    const sessionKey = this.getSessionKey(userId, sessionId);
    await this.redisService.set(sessionKey, data, this.SESSION_TTL);
  }

  private async setSessionInRedis(
    userId: string,
    sessionId: string,
    data: {
      refreshTokenHash?: string;
      isValid: boolean;
      lastUsed?: string;
      deviceInfo?: any;
    },
  ): Promise<void> {
    const sessionKey = this.getSessionKey(userId, sessionId);
    await this.redisService.set(sessionKey, data, this.SESSION_TTL);
  }

  private handleError(error: any, context: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`Error ${context}: ${error.message}`, error.stack);
    throw new InternalServerErrorException(`Failed to ${context}`);
  }
}
