import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { authenticator } from 'otplib';
import { TwoFactorService } from './two-factor.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';

const createMockSpan = () => ({
  setAttribute: jest.fn(),
  setStatus: jest.fn(),
  end: jest.fn(),
  recordException: jest.fn(),
});

const createMockObservabilityService = (span = createMockSpan()) => ({
  withSpan: jest.fn(<T>(_name: string, fn: (s: unknown) => Promise<T>) => fn(span)),
});

jest.mock('qrcode', () => {
  const toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,mock');
  return {
    __esModule: true,
    toDataURL,
    default: { toDataURL },
  };
});
import { User } from 'src/user/entities/user.entity';
import { UserBackupCode } from 'src/auth/entities/user-backup-code.entity';
import { RedisService } from 'src/shared/redis/redis.service';

const tempSecret = 'JBSWY3DPEHPK3PXP';
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
  twoFactorSecret: tempSecret,
} as User;

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let redisService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let userRepository: { findOne: jest.Mock; update: jest.Mock };
  let backupCodeRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    backupCodeRepository = {
      create: jest.fn(dto => ({ ...dto, id: 'backup-id' })),
      save: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        { provide: RedisService, useValue: redisService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('SyntiIQ') },
        },
        {
          provide: ObservabilityService,
          useValue: createMockObservabilityService(),
        },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(UserBackupCode), useValue: backupCodeRepository },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('returns secret and qrCode and stores temp secret in Redis', async () => {
      const result = await service.generateSecret(mockUser);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(typeof result.secret).toBe('string');
      expect(result.qrCode).toMatch(/^data:image\/png;base64,/);
      expect(redisService.set).toHaveBeenCalledWith(
        `2fa:setup:${mockUser.id}`,
        expect.any(String),
        300,
      );
    });
  });

  describe('verifyAndActivate', () => {
    it('throws BadRequestException when temp secret not in Redis', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(service.verifyAndActivate(mockUser, '123456')).rejects.toThrow(
        BadRequestException,
      );
      expect(redisService.del).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when token is invalid', async () => {
      redisService.get.mockResolvedValue('JBSWY3DPEHPK3PXP');

      await expect(service.verifyAndActivate(mockUser, '000000')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('persists secret, deletes Redis key, and returns backup codes when valid', async () => {
      redisService.get.mockResolvedValue(tempSecret);
      backupCodeRepository.save.mockResolvedValue([]);

      const validToken = authenticator.generate(tempSecret);

      const result = await service.verifyAndActivate(mockUser, validToken);

      expect(result.success).toBe(true);
      expect(result.backupCodes).toHaveLength(8);
      expect(result.backupCodes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(redisService.del).toHaveBeenCalledWith(`2fa:setup:${mockUser.id}`);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        twoFactorSecret: tempSecret,
      });
    });
  });

  describe('verify', () => {
    it('returns false when user has no twoFactorSecret', async () => {
      const userNoSecret = { ...mockUser, twoFactorSecret: undefined };
      expect(await service.verify(userNoSecret as User, '123456')).toBe(false);
    });

    it('returns true when token is valid', async () => {
      const validToken = authenticator.generate(mockUser.twoFactorSecret!);
      const result = await service.verify(mockUser, validToken);
      expect(result).toBe(true);
    });
  });

  describe('disable', () => {
    it('throws UnauthorizedException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.disable('user-123', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException when 2FA not enabled', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-123',
        twoFactorSecret: null,
      });

      await expect(service.disable('user-123', '123456')).rejects.toThrow(BadRequestException);
    });

    it('clears twoFactorSecret when valid TOTP provided', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-123',
        twoFactorSecret: mockUser.twoFactorSecret,
      });

      const validToken = authenticator.generate(mockUser.twoFactorSecret!);
      await service.disable('user-123', validToken);

      expect(userRepository.update).toHaveBeenCalledWith('user-123', {
        twoFactorSecret: null,
      });
      expect(backupCodeRepository.delete).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });

    it('throws UnauthorizedException when token and backup code invalid', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-123',
        twoFactorSecret: mockUser.twoFactorSecret,
      });
      backupCodeRepository.findOne.mockResolvedValue(null);

      await expect(service.disable('user-123', '000000')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getStatus', () => {
    it('returns enabled false when user has no twoFactorSecret', async () => {
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        twoFactorSecret: null,
      });
      backupCodeRepository.count.mockResolvedValue(0);

      const result = await service.getStatus(mockUser);

      expect(result.enabled).toBe(false);
      expect(result.method).toBeNull();
      expect(result.backupCodesRemaining).toBe(0);
    });

    it('returns enabled true and backup codes count when 2FA active', async () => {
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        twoFactorSecret: 'secret',
      });
      backupCodeRepository.count.mockResolvedValue(5);

      const result = await service.getStatus(mockUser);

      expect(result.enabled).toBe(true);
      expect(result.method).toBe('authenticator');
      expect(result.backupCodesRemaining).toBe(5);
    });
  });

  describe('verifyBackupCode', () => {
    it('returns false when no matching unused backup code', async () => {
      backupCodeRepository.findOne.mockResolvedValue(null);

      const result = await service.verifyBackupCode('user-123', 'ABCD-1234-EFGH');

      expect(result).toBe(false);
    });

    it('returns true and marks code as used when valid', async () => {
      backupCodeRepository.findOne.mockResolvedValue({
        id: 'backup-id',
        userId: 'user-123',
        codeHash: createHash('sha256').update('ABCD-1234-EFGH'.toUpperCase().trim()).digest('hex'),
        usedAt: null,
      });

      const result = await service.verifyBackupCode('user-123', 'ABCD-1234-EFGH');

      expect(result).toBe(true);
      expect(backupCodeRepository.update).toHaveBeenCalledWith(
        'backup-id',
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
    });
  });
});
