import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AnomalyDetectionService } from '../anomaly-detection.service';
import { RedisService } from 'src/shared/redis/redis.service';

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService;
  let redis: jest.Mocked<Pick<RedisService, 'get' | 'set' | 'incr' | 'expire' | 'getClient'>>;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnomalyDetectionService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn().mockResolvedValue(1),
            expire: jest.fn().mockResolvedValue(true),
            getClient: jest.fn().mockReturnValue(mockRedisClient),
          },
        },
      ],
    }).compile();

    service = module.get(AnomalyDetectionService);
    redis = module.get(RedisService) as any;
  });

  describe('recordTokenUsage', () => {
    it('uses atomic INCR instead of read-modify-write for refresh count', async () => {
      redis.get.mockResolvedValue({ isValid: true, refreshTokenHash: 'hash' });

      await service.recordTokenUsage('user-1', 'session-1', {
        ipAddress: '1.2.3.4',
        userAgent: 'test-agent',
      });

      expect(redis.incr).toHaveBeenCalledWith(
        expect.stringContaining('refresh_count:user-1:session-1'),
      );
    });

    it('sets TTL on the refresh counter key when first created (count === 1)', async () => {
      redis.get.mockResolvedValue(null);
      redis.incr.mockResolvedValue(1);

      await service.recordTokenUsage('user-1', 'session-1', {});

      expect(redis.expire).toHaveBeenCalled();
    });

    it('does NOT reset TTL on subsequent increments (count > 1)', async () => {
      redis.get.mockResolvedValue(null);
      redis.incr.mockResolvedValue(5);

      await service.recordTokenUsage('user-1', 'session-1', {});

      expect(redis.expire).not.toHaveBeenCalled();
    });
  });

  describe('detectTokenReuse', () => {
    it('returns no anomaly when session data is not in Redis', async () => {
      redis.get.mockResolvedValue(null);
      const result = await service.detectTokenReuse('user-1', 'session-1', {});
      expect(result.isAnomaly).toBe(false);
    });

    it('reads refresh count from separate key, not from session payload', async () => {
      redis.get.mockImplementation(async (key: string) => {
        return { deviceInfo: { ipAddress: '1.2.3.4' }, isValid: true };
      });
      mockRedisClient.get.mockResolvedValue('101');

      const result = await service.detectTokenReuse('user-1', 'session-1', {
        ipAddress: '1.2.3.4',
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.reason).toContain('Excessive token refreshes');
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        expect.stringContaining('session:refresh_count:user-1:session-1'),
      );
    });

    it('detects IP address change', async () => {
      redis.get.mockImplementation(async (key: string) => {
        return { deviceInfo: { ipAddress: '1.2.3.4', userAgent: 'agent' } };
      });
      mockRedisClient.get.mockResolvedValue('0');

      const result = await service.detectTokenReuse('user-1', 'session-1', {
        ipAddress: '9.9.9.9',
        userAgent: 'agent',
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.reason).toContain('IP address changed');
    });

    it('returns high severity when multiple anomalies detected', async () => {
      redis.get.mockImplementation(async (key: string) => {
        return { deviceInfo: { ipAddress: '1.2.3.4', userAgent: 'old-agent' } };
      });
      mockRedisClient.get.mockResolvedValue('0');

      const result = await service.detectTokenReuse('user-1', 'session-1', {
        ipAddress: '9.9.9.9',
        userAgent: 'new-agent',
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe('high');
    });
  });
});
