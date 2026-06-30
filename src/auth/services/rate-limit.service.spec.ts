import { Test, type TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { RedisService } from 'src/shared/redis/redis.service';

describe('RateLimitService', () => {
  let service: RateLimitService;
  let redis: { incr: jest.Mock; expire: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    redis = {
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitService, { provide: RedisService, useValue: redis }],
    }).compile();

    service = module.get(RateLimitService);
    jest.clearAllMocks();
  });

  it('allows attempts up to threshold', async () => {
    redis.incr.mockResolvedValueOnce(1);
    redis.expire.mockResolvedValueOnce(1);

    await expect(service.checkRateLimit('a@b.com', '1.1.1.1')).resolves.toBeUndefined();
    expect(redis.expire).toHaveBeenCalled();
  });

  it('throws 429 when attempts exceed max', async () => {
    redis.incr.mockResolvedValueOnce(6);

    let caught: unknown;
    try {
      await service.checkRateLimit('a@b.com', '1.1.1.1');
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(HttpException);
    expect((caught as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
  });

  it('clearRateLimit deletes redis key', async () => {
    await service.clearRateLimit('a@b.com', '1.1.1.1');
    expect(redis.del).toHaveBeenCalledWith('login_attempts:a@b.com:1.1.1.1');
  });
});
