import { Test, type TestingModule } from '@nestjs/testing';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { createMockObservabilityService } from 'src/auth/__tests__/mocks';
import {
  buildSessionKey,
  buildRefreshCountKey,
} from 'src/user-session/constants/user-session-cache.constants';

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService;
  let redisClientGet: jest.Mock;
  let redis: {
    get: jest.Mock;
    set: jest.Mock;
    getClient: jest.Mock;
    incr: jest.Mock;
    expire: jest.Mock;
  };

  beforeEach(async () => {
    redisClientGet = jest.fn();
    redis = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      getClient: jest.fn().mockReturnValue({ get: redisClientGet }),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnomalyDetectionService,
        { provide: RedisService, useValue: redis },
        { provide: ObservabilityService, useValue: createMockObservabilityService() },
      ],
    }).compile();

    service = module.get(AnomalyDetectionService);
    jest.clearAllMocks();
    redis.getClient.mockReturnValue({ get: redisClientGet });
  });

  it('returns no anomaly when session data is missing', async () => {
    redis.get.mockResolvedValueOnce(null);

    await expect(
      service.detectTokenReuse('u1', 's1', { ipAddress: '1.1.1.1', userAgent: 'A' }),
    ).resolves.toEqual({ isAnomaly: false });
  });

  it('flags IP change as anomaly', async () => {
    redis.get.mockResolvedValueOnce({
      deviceInfo: { ipAddress: '10.0.0.1', userAgent: 'SameAgent' },
    });
    redisClientGet.mockResolvedValueOnce('0');

    const result = await service.detectTokenReuse('u1', 's1', {
      ipAddress: '10.0.0.2',
      userAgent: 'SameAgent',
    });

    expect(result.isAnomaly).toBe(true);
    expect(result.reason).toContain('IP');
  });

  it('flags excessive refreshes from refresh counter key', async () => {
    redis.get.mockResolvedValueOnce({
      deviceInfo: { ipAddress: '10.0.0.1', userAgent: 'A' },
    });
    redisClientGet.mockResolvedValueOnce('101');

    const result = await service.detectTokenReuse('u1', 's1', {
      ipAddress: '10.0.0.1',
      userAgent: 'A',
    });

    expect(result.isAnomaly).toBe(true);
    expect(result.reason).toContain('refresh');
  });

  it('recordTokenUsage merges metadata and increments refresh counter', async () => {
    redis.get.mockResolvedValueOnce({
      deviceInfo: { userAgent: 'OldUA' },
    });

    await service.recordTokenUsage('u1', 's1', { ipAddress: '10.0.0.1' });

    expect(redis.set).toHaveBeenCalledWith(
      buildSessionKey('u1', 's1'),
      expect.objectContaining({
        deviceInfo: expect.objectContaining({ ipAddress: '10.0.0.1', userAgent: 'OldUA' }),
        lastRefresh: expect.any(String),
      }),
      expect.any(Number),
    );
    expect(redis.incr).toHaveBeenCalledWith(buildRefreshCountKey('u1', 's1'));
    expect(redis.expire).toHaveBeenCalled();
  });

  it('recordTokenUsage sets expire only on first counter increment', async () => {
    redis.get.mockResolvedValueOnce({});
    redis.incr.mockResolvedValueOnce(2);

    await service.recordTokenUsage('u1', 's1', { ipAddress: '10.0.0.1' });

    expect(redis.expire).not.toHaveBeenCalled();
  });
});
