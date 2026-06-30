import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthSessionManager } from './auth-session-manager.service';
import { TokenFactory } from 'src/auth/factory/token-factory';
import { UserSessionService } from 'src/user-session/user-session.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { createMockObservabilityService } from 'src/auth/__tests__/mocks';

describe('AuthSessionManager', () => {
  let manager: AuthSessionManager;
  let tokenFactory: {
    generateId: jest.Mock;
    generateTokens: jest.Mock;
    verifyAccessToken: jest.Mock;
    decodeToken: jest.Mock;
    verifyRefreshToken: jest.Mock;
    invalidateRefreshToken: jest.Mock;
  };
  let sessionService: {
    createSession: jest.Mock;
    setSessionInRedisUnified: jest.Mock;
    findActiveByUserId: jest.Mock;
  };
  let redisService: { get: jest.Mock };
  let anomalyDetectionService: { detectTokenReuse: jest.Mock; recordTokenUsage: jest.Mock };
  let observabilityService: ReturnType<typeof createMockObservabilityService>;

  beforeEach(async () => {
    observabilityService = createMockObservabilityService();
    tokenFactory = {
      generateId: jest.fn().mockReturnValue('session-uuid'),
      generateTokens: jest.fn().mockResolvedValue({
        tokens: { token: { token: 'access' }, refreshToken: { token: 'refresh' } },
        refreshTokenHash: 'hash',
      }),
      verifyAccessToken: jest.fn(),
      decodeToken: jest.fn(),
      verifyRefreshToken: jest.fn().mockResolvedValue({ userId: 'u1', sessionId: 's1' }),
      invalidateRefreshToken: jest.fn().mockResolvedValue(undefined),
    };
    sessionService = {
      createSession: jest.fn().mockResolvedValue(undefined),
      setSessionInRedisUnified: jest.fn().mockResolvedValue(undefined),
      findActiveByUserId: jest.fn().mockResolvedValue([]),
    };
    redisService = {
      get: jest.fn().mockResolvedValue({
        refreshTokenHash: 'h',
        isValid: true,
        deviceInfo: null,
      }),
    };
    anomalyDetectionService = {
      detectTokenReuse: jest.fn().mockResolvedValue({ isAnomaly: false }),
      recordTokenUsage: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSessionManager,
        { provide: TokenFactory, useValue: tokenFactory },
        { provide: UserSessionService, useValue: sessionService },
        { provide: RedisService, useValue: redisService },
        { provide: AnomalyDetectionService, useValue: anomalyDetectionService },
        { provide: ObservabilityService, useValue: observabilityService },
      ],
    }).compile();

    manager = module.get(AuthSessionManager);
    jest.clearAllMocks();
    observabilityService.withSpan.mockImplementation(
      <T>(_name: string, fn: (s: unknown) => Promise<T>) => fn({ setAttribute: jest.fn() }),
    );
    tokenFactory.generateId.mockReturnValue('session-uuid');
    tokenFactory.generateTokens.mockResolvedValue({
      tokens: { token: { token: 'access' }, refreshToken: { token: 'refresh' } },
      refreshTokenHash: 'hash',
    });
  });

  it('should be defined', () => {
    expect(manager).toBeDefined();
  });

  it('createSession throws BadRequestException when userId is empty', async () => {
    await expect(manager.createSession('', { lastUsed: new Date() })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('createSession persists session and returns tokens', async () => {
    const meta = {
      lastUsed: new Date(),
      deviceInfo: {
        deviceType: 'desktop',
        deviceName: null,
        browser: 'Jest',
        browserVersion: '1',
        os: 'Linux',
        osVersion: '1',
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      },
    };

    const result = await manager.createSession('user-1', meta);

    expect(result.sessionId).toBe('session-uuid');
    expect(sessionService.createSession).toHaveBeenCalled();
    expect(sessionService.setSessionInRedisUnified).toHaveBeenCalledWith(
      'user-1',
      'session-uuid',
      expect.objectContaining({ refreshTokenHash: 'hash', isValid: true }),
    );
  });

  it('createSession wraps InternalServerErrorException on unexpected errors', async () => {
    tokenFactory.generateTokens.mockRejectedValueOnce(new Error('jwt down'));

    await expect(manager.createSession('user-1', { lastUsed: new Date() })).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('verifyRefreshToken delegates to TokenFactory', async () => {
    await expect(manager.verifyRefreshToken('rt')).resolves.toEqual({
      userId: 'u1',
      sessionId: 's1',
    });
    expect(tokenFactory.verifyRefreshToken).toHaveBeenCalledWith('rt');
  });

  it('extractSessionIdFromToken returns sid when verify succeeds', () => {
    tokenFactory.verifyAccessToken.mockReturnValue({ sub: 'u1', sid: 's1', jti: 'j1' });

    expect(manager.extractSessionIdFromToken('tok', 'u1')).toBe('s1');
  });

  it('extractSessionIdFromToken returns null when verify throws without using unverified decode', () => {
    tokenFactory.verifyAccessToken.mockImplementation(() => {
      throw new Error('expired');
    });
    const decodeSpy = jest.spyOn(tokenFactory, 'decodeToken');

    expect(manager.extractSessionIdFromToken('tok', 'u1')).toBeNull();
    expect(decodeSpy).not.toHaveBeenCalled();
  });

  it('refreshSession throws when anomaly severity is high', async () => {
    anomalyDetectionService.detectTokenReuse.mockResolvedValue({
      isAnomaly: true,
      severity: 'high',
      reason: 'IP changed',
    });

    await expect(
      manager.refreshSession('u1', 's1', 'rt', { lastUsed: new Date() }),
    ).rejects.toThrow(BadRequestException);
  });
});
