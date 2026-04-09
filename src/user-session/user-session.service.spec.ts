import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { UserSessionRepository } from './user-session.repository';
import { RedisService } from 'src/shared/redis/redis.service';
import type { UserSession } from './entities/user-session.entity';

function makeSession(overrides: Partial<UserSession> = {}): UserSession {
  return {
    id: 'id-1',
    userId: 'user-1',
    sessionId: 'session-1',
    refreshToken: 'hash',
    deviceInfo: null,
    userAgent: 'Mozilla/5.0',
    ipAddress: '1.2.3.4',
    lastUsed: new Date('2026-01-01T00:00:00Z'),
    isValid: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  } as UserSession;
}

describe('UserSessionService', () => {
  let service: UserSessionService;
  let repo: jest.Mocked<UserSessionRepository>;
  let redis: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSessionService,
        {
          provide: UserSessionRepository,
          useValue: {
            findByUserAndSessionId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findActiveByUserId: jest.fn(),
            invalidateAllForUser: jest.fn(),
            findByDeviceInfo: jest.fn(),
            invalidateByDeviceInfo: jest.fn(),
            findByDeviceType: jest.fn(),
            invalidateByDeviceType: jest.fn(),
            invalidateAllExcept: jest.fn(),
            deleteOlderThan: jest.fn(),
            getActiveSessions: jest.fn(),
          } as Partial<jest.Mocked<UserSessionRepository>>,
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          } as Partial<jest.Mocked<RedisService>>,
        },
      ],
    }).compile();

    service = module.get(UserSessionService);
    repo = module.get(UserSessionRepository) as jest.Mocked<UserSessionRepository>;
    redis = module.get(RedisService) as jest.Mocked<RedisService>;
  });

  describe('invalidateSession', () => {
    it('updates DB before deleting from Redis', async () => {
      const callOrder: string[] = [];
      repo.update.mockImplementation(async () => {
        callOrder.push('db');
        return 1;
      });
      redis.del.mockImplementation(async () => {
        callOrder.push('redis');
      });

      await service.invalidateSession('user-1', 'session-1');
      expect(callOrder).toEqual(['db', 'redis']);
    });

    it('does not delete from Redis if DB update throws', async () => {
      repo.update.mockRejectedValue(new Error('DB unavailable'));
      await expect(service.invalidateSession('user-1', 'session-1')).rejects.toThrow();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when userId is missing', async () => {
      await expect(service.invalidateSession('', 'session-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws BadRequestException when sessionId is missing', async () => {
      await expect(service.invalidateSession('user-1', '')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('invalidateAllSessions', () => {
    it('updates DB before deleting from Redis', async () => {
      const callOrder: string[] = [];
      const mockSessions = [{ sessionId: 'session-1' }, { sessionId: 'session-2' }];

      repo.findActiveByUserId.mockResolvedValue(mockSessions as any);
      repo.invalidateAllForUser.mockImplementation(async () => {
        callOrder.push('db');
        return 2;
      });
      redis.del.mockImplementation(async () => {
        callOrder.push('redis');
      });

      await service.invalidateAllSessions('user-1');
      expect(callOrder).toEqual(['db', 'redis']);
    });

    it('does not delete from Redis if DB update throws', async () => {
      repo.findActiveByUserId.mockResolvedValue([makeSession()]);
      repo.invalidateAllForUser.mockRejectedValue(new Error('DB unavailable'));
      await expect(service.invalidateAllSessions('user-1')).rejects.toThrow();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('returns early if no active sessions', async () => {
      repo.findActiveByUserId.mockResolvedValue([]);
      await service.invalidateAllSessions('user-1');
      expect(repo.invalidateAllForUser).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('invalidateDeviceSessions', () => {
    it('updates DB before deleting from Redis', async () => {
      const callOrder: string[] = [];
      const mockSessions = [{ sessionId: 'session-1' }];

      repo.findByDeviceType.mockResolvedValue(mockSessions as any);
      repo.invalidateByDeviceType.mockImplementation(async () => {
        callOrder.push('db');
        return 1;
      });
      redis.del.mockImplementation(async () => {
        callOrder.push('redis');
      });

      await service.invalidateDeviceSessions('user-1', 'mobile');
      expect(callOrder).toEqual(['db', 'redis']);
    });

    it('returns early if no sessions found for device type', async () => {
      repo.findByDeviceType.mockResolvedValue([]);
      await service.invalidateDeviceSessions('user-1', 'mobile');
      expect(repo.invalidateByDeviceType).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('does not delete from Redis if DB update throws', async () => {
      repo.findByDeviceType.mockResolvedValue([makeSession()]);
      repo.invalidateByDeviceType.mockRejectedValue(new Error('DB unavailable'));
      await expect(service.invalidateDeviceSessions('user-1', 'mobile')).rejects.toThrow();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when device type is missing', async () => {
      await expect(service.invalidateDeviceSessions('user-1', '')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('invalidateOtherSessions', () => {
    it('updates DB before deleting from Redis', async () => {
      const callOrder: string[] = [];
      const mockSessions = [{ sessionId: 'session-1' }, { sessionId: 'session-2' }];

      repo.findActiveByUserId.mockResolvedValue(mockSessions as any);
      repo.invalidateAllExcept.mockImplementation(async () => {
        callOrder.push('db');
        return 1;
      });
      redis.del.mockImplementation(async () => {
        callOrder.push('redis');
      });

      await service.invalidateOtherSessions('user-1', 'session-1');
      expect(callOrder).toEqual(['db', 'redis']);
    });

    it('does not delete from Redis if DB update throws', async () => {
      const session1 = makeSession({ sessionId: 'session-1' });
      const session2 = makeSession({ sessionId: 'session-2' });
      repo.findActiveByUserId.mockResolvedValue([session1, session2]);
      repo.invalidateAllExcept.mockRejectedValue(new Error('DB unavailable'));
      await expect(service.invalidateOtherSessions('user-1', 'session-1')).rejects.toThrow();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('returns early if no other sessions exist', async () => {
      repo.findActiveByUserId.mockResolvedValue([{ sessionId: 'session-1' }] as any);
      await service.invalidateOtherSessions('user-1', 'session-1');
      expect(repo.invalidateAllExcept).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('invalidateSessionsByDeviceInfo', () => {
    it('updates DB before deleting from Redis', async () => {
      const callOrder: string[] = [];
      const mockSessions = [{ sessionId: 'session-1' }];
      const deviceInfo = { userAgent: 'Mozilla' };

      repo.findByDeviceInfo.mockResolvedValue(mockSessions as any);
      repo.invalidateByDeviceInfo.mockImplementation(async () => {
        callOrder.push('db');
        return 1;
      });
      redis.del.mockImplementation(async () => {
        callOrder.push('redis');
      });

      await service.invalidateSessionsByDeviceInfo('user-1', deviceInfo);
      expect(callOrder).toEqual(['db', 'redis']);
    });

    it('does not delete from Redis if DB update throws', async () => {
      repo.findByDeviceInfo.mockResolvedValue([makeSession()]);
      repo.invalidateByDeviceInfo.mockRejectedValue(new Error('DB unavailable'));
      await expect(
        service.invalidateSessionsByDeviceInfo('user-1', { userAgent: 'Mozilla' }),
      ).rejects.toThrow();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('returns 0 if no sessions found', async () => {
      repo.findByDeviceInfo.mockResolvedValue([]);
      const result = await service.invalidateSessionsByDeviceInfo('user-1', {});
      expect(result).toBe(0);
      expect(repo.invalidateByDeviceInfo).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('validateSessionOwnership', () => {
    it('returns true from Redis cache when session is valid', async () => {
      redis.get.mockResolvedValue({ isValid: true });
      const result = await service.validateSessionOwnership('user-1', 'session-1');
      expect(result).toBe(true);
      expect(repo.findByUserAndSessionId).not.toHaveBeenCalled();
    });

    it('returns false from Redis cache when session is invalid', async () => {
      redis.get.mockResolvedValue({ isValid: false });
      const result = await service.validateSessionOwnership('user-1', 'session-1');
      expect(result).toBe(false);
    });

    it('falls back to DB when Redis misses and re-caches the session', async () => {
      const session = makeSession({ refreshToken: 'hash', isValid: true });
      redis.get.mockResolvedValue(null);
      repo.findByUserAndSessionId.mockResolvedValue(session);

      const result = await service.validateSessionOwnership('user-1', 'session-1');

      expect(result).toBe(true);
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('session:user-1:session-1'),
        expect.objectContaining({ refreshTokenHash: 'hash', isValid: true }),
        expect.any(Number),
      );
    });

    it('returns false when Redis misses and DB finds no valid session', async () => {
      redis.get.mockResolvedValue(null);
      repo.findByUserAndSessionId.mockResolvedValue(null);

      const result = await service.validateSessionOwnership('user-1', 'session-1');

      expect(result).toBe(false);
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when userId is empty', async () => {
      await expect(service.validateSessionOwnership('', 'session-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('createSession', () => {
    it('persists session via repository and returns response DTO', async () => {
      const session = makeSession();
      repo.create.mockResolvedValue(session);

      const result = await service.createSession({
        userId: 'user-1',
        sessionId: 'session-1',
        refreshToken: 'hash',
        deviceInfo: null,
        userAgent: 'Mozilla/5.0',
        ipAddress: '1.2.3.4',
        lastUsed: new Date(),
      });

      expect(repo.create).toHaveBeenCalled();
      expect(result.sessionId).toBe('session-1');
    });

    it('throws BadRequestException when userId is missing', async () => {
      await expect(
        service.createSession({
          userId: '',
          sessionId: 'session-1',
          refreshToken: 'hash',
          deviceInfo: null,
          userAgent: null,
          ipAddress: null,
          lastUsed: new Date(),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('setSessionInRedisUnified', () => {
    it('stores session data in Redis with SESSION_TTL_S', async () => {
      await service.setSessionInRedisUnified('user-1', 'session-1', {
        refreshTokenHash: 'hash',
        isValid: true,
      });

      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('session:user-1:session-1'),
        expect.objectContaining({ refreshTokenHash: 'hash', isValid: true }),
        expect.any(Number),
      );
    });
  });
});
