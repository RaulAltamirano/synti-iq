import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AnomalyDetectionService } from '../anomaly-detection.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';

// RFC 5737 TEST-NET (documentation-only ranges; string literals only in mocked tests)
const IP_ORIGINAL = '192.0.2.1';
const IP_CHANGED = '198.51.100.1';

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService;
  let redis: jest.Mocked<Pick<RedisService, 'get' | 'set' | 'incr' | 'expire' | 'getClient'>>;
  let mockRedisClient: { get: jest.Mock };

  function setupSession(
    deviceInfo: { ipAddress?: string; userAgent?: string },
    rawRefreshCount = '0',
  ): void {
    redis.get.mockResolvedValue({ deviceInfo, isValid: true });
    mockRedisClient.get.mockResolvedValue(rawRefreshCount);
  }

  beforeEach(async () => {
    mockRedisClient = { get: jest.fn() };

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
        {
          provide: ObservabilityService,
          useValue: {
            withSpan: jest.fn().mockImplementation((_name: string, fn: () => unknown) => fn()),
          },
        },
      ],
    }).compile();

    service = module.get(AnomalyDetectionService);
    redis = module.get(RedisService) as jest.Mocked<
      Pick<RedisService, 'get' | 'set' | 'incr' | 'expire' | 'getClient'>
    >;
  });

  describe('recordTokenUsage', () => {
    it('uses atomic INCR instead of read-modify-write for refresh count', async () => {
      redis.get.mockResolvedValue({ isValid: true, refreshTokenHash: 'hash' });

      await service.recordTokenUsage('user-1', 'session-1', {
        ipAddress: IP_ORIGINAL,
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
      setupSession({ ipAddress: IP_ORIGINAL }, '101');

      const result = await service.detectTokenReuse('user-1', 'session-1', {
        ipAddress: IP_ORIGINAL,
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.reason).toContain('Excessive token refreshes');
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        expect.stringContaining('session:refresh_count:user-1:session-1'),
      );
    });

    it('detects IP address change', async () => {
      setupSession({ ipAddress: IP_ORIGINAL, userAgent: 'agent' });

      const result = await service.detectTokenReuse('user-1', 'session-1', {
        ipAddress: IP_CHANGED,
        userAgent: 'agent',
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.reason).toContain('IP address changed');
    });

    it('returns high severity when multiple anomalies detected', async () => {
      setupSession({ ipAddress: IP_ORIGINAL, userAgent: 'old-agent' });

      const result = await service.detectTokenReuse('user-1', 'session-1', {
        ipAddress: IP_CHANGED,
        userAgent: 'new-agent',
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe('high');
    });
  });
});
