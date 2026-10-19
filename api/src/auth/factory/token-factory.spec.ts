import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { TokenFactory } from './token-factory';
import { PasswordService } from '../services/password/password.service';
import { JwtService } from 'src/shared/jwt-helper/jwt.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { UserSessionService } from 'src/user-session/user-session.service';

describe('TokenFactory', () => {
  let factory: TokenFactory;
  let jwtService: {
    verifyRefreshToken: jest.Mock;
    verifyAccessToken: jest.Mock;
    decodeToken: jest.Mock;
    generateAccessToken: jest.Mock;
    generateRefreshToken: jest.Mock;
  };
  let redisService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let passwordService: { hash: jest.Mock; compare: jest.Mock };
  let userSessionService: { invalidateSession: jest.Mock };

  beforeEach(async () => {
    jwtService = {
      verifyRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      decodeToken: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    };
    redisService = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    passwordService = { hash: jest.fn(), compare: jest.fn() };
    userSessionService = { invalidateSession: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenFactory,
        { provide: JwtService, useValue: jwtService },
        { provide: RedisService, useValue: redisService },
        { provide: PasswordService, useValue: passwordService },
        { provide: UserSessionService, useValue: userSessionService },
      ],
    }).compile();

    factory = module.get(TokenFactory);
    jest.clearAllMocks();
  });

  it('verifyRefreshToken invalidates session when refresh token matches a used token hash', async () => {
    jwtService.verifyRefreshToken.mockResolvedValue({ sub: 'u1', sid: 's1' });
    redisService.get.mockResolvedValue({
      refreshTokenHash: 'current-hash',
      isValid: true,
      usedTokens: ['used-hash'],
    });
    passwordService.compare.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await expect(factory.verifyRefreshToken('reused-plain-token')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(userSessionService.invalidateSession).toHaveBeenCalledWith('u1', 's1');
  });

  it('validateStoredRefreshToken returns false when token matches a used token hash', async () => {
    redisService.get.mockResolvedValue({
      refreshTokenHash: 'current-hash',
      isValid: true,
      usedTokens: ['used-hash'],
    });
    passwordService.compare.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await expect(
      factory.validateStoredRefreshToken('u1', 's1', 'reused-plain-token'),
    ).resolves.toBe(false);
  });
});
