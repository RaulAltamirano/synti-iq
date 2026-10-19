import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthCheckService } from './health-check.service';

type HealthEvalResult = {
  checks: { database: 'ok' | 'down'; redis: 'ok' | 'down' };
  ok: boolean;
};

async function createHealthControllerFixture(evaluateResult: HealthEvalResult): Promise<{
  controller: HealthController;
  res: { status: jest.Mock };
  evaluateMock: jest.Mock;
}> {
  const evaluateMock = jest.fn().mockResolvedValue(evaluateResult);
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [{ provide: HealthCheckService, useValue: { evaluate: evaluateMock } }],
  }).compile();

  return {
    controller: moduleRef.get(HealthController),
    res: { status: jest.fn() },
    evaluateMock,
  };
}

describe('HealthController', () => {
  it('returns ok and does not set 503 when service reports healthy', async () => {
    const { controller, res, evaluateMock } = await createHealthControllerFixture({
      ok: true,
      checks: { database: 'ok', redis: 'ok' },
    });

    const body = await controller.getHealth(res as never);

    expect(evaluateMock).toHaveBeenCalledTimes(1);
    expect(body.status).toBe('ok');
    expect(body.checks).toEqual({ database: 'ok', redis: 'ok' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'database down',
      checks: { database: 'down' as const, redis: 'ok' as const },
    },
    {
      name: 'redis down',
      checks: { database: 'ok' as const, redis: 'down' as const },
    },
  ])('returns error and 503 when $name', async ({ checks }) => {
    const { controller, res } = await createHealthControllerFixture({ ok: false, checks });

    const body = await controller.getHealth(res as never);

    expect(body.status).toBe('error');
    expect(body.checks).toEqual(checks);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
