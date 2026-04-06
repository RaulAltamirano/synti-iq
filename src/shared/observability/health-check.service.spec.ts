import { Test } from '@nestjs/testing';
import { HealthCheckService } from './health-check.service';
import { HealthRepository } from './health.repository';
import { RedisService } from 'src/shared/redis/redis.service';

describe('HealthCheckService', () => {
  function createRedisService(pingImpl: () => Promise<string>): RedisService {
    return {
      getClient: () => ({ ping: jest.fn().mockImplementation(pingImpl) }),
    } as unknown as RedisService;
  }

  async function createService(mocks: {
    dbPing: boolean;
    redisPing: () => Promise<string>;
  }): Promise<HealthCheckService> {
    const healthRepository = { ping: jest.fn().mockResolvedValue(mocks.dbPing) };
    const redisService = createRedisService(mocks.redisPing);

    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        { provide: HealthRepository, useValue: healthRepository },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    return moduleRef.get(HealthCheckService);
  }

  it('returns ok when database and redis succeed', async () => {
    const service = await createService({
      dbPing: true,
      redisPing: async () => 'PONG',
    });

    const result = await service.evaluate();

    expect(result.ok).toBe(true);
    expect(result.checks).toEqual({ database: 'ok', redis: 'ok' });
  });

  it('marks database down when repository ping is false', async () => {
    const service = await createService({
      dbPing: false,
      redisPing: async () => 'PONG',
    });

    const result = await service.evaluate();

    expect(result.ok).toBe(false);
    expect(result.checks).toEqual({ database: 'down', redis: 'ok' });
  });

  it('marks redis down when ping throws', async () => {
    const service = await createService({
      dbPing: true,
      redisPing: async () => {
        throw new Error('redis down');
      },
    });

    const result = await service.evaluate();

    expect(result.ok).toBe(false);
    expect(result.checks).toEqual({ database: 'ok', redis: 'down' });
  });
});
