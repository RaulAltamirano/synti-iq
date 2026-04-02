import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { MetricsAuthGuard } from './metrics-auth.guard';

function makeContext(req: {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as ExecutionContext;
}

function guardWithKey(key: string | undefined, nodeEnv?: string): MetricsAuthGuard {
  const config = {
    get: jest.fn((k: string) => {
      if (k === 'METRICS_API_KEY') return key;
      if (k === 'NODE_ENV') return nodeEnv;
      return undefined;
    }),
  } as unknown as ConfigService;
  return new MetricsAuthGuard(config);
}

describe('MetricsAuthGuard', () => {
  describe('when METRICS_API_KEY is set', () => {
    it('allows X-Metrics-Key match', () => {
      const guard = guardWithKey('secret-key');
      const ctx = makeContext({
        headers: { 'x-metrics-key': 'secret-key' },
        socket: {},
      });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows Bearer token match', () => {
      const guard = guardWithKey('secret-key');
      const ctx = makeContext({
        headers: { authorization: 'Bearer secret-key' },
        socket: {},
      });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('denies wrong key', () => {
      const guard = guardWithKey('secret-key');
      const ctx = makeContext({
        headers: { 'x-metrics-key': 'wrong' },
        socket: {},
      });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('when METRICS_API_KEY is unset', () => {
    it('allows development from loopback IPv4', () => {
      const guard = guardWithKey(undefined, 'development');
      const ctx = makeContext({
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
      });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows development from IPv6 loopback', () => {
      const guard = guardWithKey(undefined, 'development');
      const ctx = makeContext({
        headers: {},
        socket: { remoteAddress: '::1' },
      });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('denies development from non-loopback', () => {
      const guard = guardWithKey(undefined, 'development');
      const ctx = makeContext({
        headers: {},
        socket: { remoteAddress: '192.168.1.1' },
      });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('denies production even from loopback', () => {
      const guard = guardWithKey(undefined, 'production');
      const ctx = makeContext({
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
      });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });
});
