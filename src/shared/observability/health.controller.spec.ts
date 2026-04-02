import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { RedisService } from 'src/shared/redis/redis.service';

describe('HealthController', () => {
  it('returns ok and does not set error status when db and redis are healthy', async () => {
    const dataSource = { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const redisService = {
      getClient: () => ({ ping: jest.fn().mockResolvedValue('PONG') }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const res = { status: jest.fn() };

    const body = await controller.getHealth(res as never);

    expect(body.status).toBe('ok');
    expect(body.checks.database).toBe('ok');
    expect(body.checks.redis).toBe('ok');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns error and 503 when database check fails', async () => {
    const dataSource = { query: jest.fn().mockRejectedValue(new Error('connection refused')) };
    const redisService = {
      getClient: () => ({ ping: jest.fn().mockResolvedValue('PONG') }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const res = { status: jest.fn() };

    const body = await controller.getHealth(res as never);

    expect(body.status).toBe('error');
    expect(body.checks.database).toBe('down');
    expect(body.checks.redis).toBe('ok');
    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('returns error and 503 when redis check fails', async () => {
    const dataSource = { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const redisService = {
      getClient: () => ({ ping: jest.fn().mockRejectedValue(new Error('redis down')) }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const res = { status: jest.fn() };

    const body = await controller.getHealth(res as never);

    expect(body.status).toBe('error');
    expect(body.checks.database).toBe('ok');
    expect(body.checks.redis).toBe('down');
    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
