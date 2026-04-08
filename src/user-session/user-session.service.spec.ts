import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { UserSessionRepository } from './user-session.repository';
import { RedisService } from 'src/shared/redis/redis.service';

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

    it('returns 0 if no sessions found', async () => {
      repo.findByDeviceInfo.mockResolvedValue([]);
      const result = await service.invalidateSessionsByDeviceInfo('user-1', {});
      expect(result).toBe(0);
      expect(repo.invalidateByDeviceInfo).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});
