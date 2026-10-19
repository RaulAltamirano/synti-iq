import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { SessionService } from 'src/auth/session/session.service';
import { PasswordService } from 'src/auth/services/password/password.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { AuthSessionManager } from './services/auth-session-manager.service';
import { AuthMetadataService } from './services/auth-metadata.service';
import { RateLimitService } from './services/rate-limit.service';
import { ReferralService } from 'src/referral/referral.service';
import { MailService } from 'src/mail/mail.service';
import { TwoFactorService } from './services/two-factor.service';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import type { LoginUserDto } from './dto/login-user.dto';
import { DataSource, IsNull } from 'typeorm';

const twoFactorSecret = 'JBSWY3DPEHPK3PXP';
const mockUserWith2FA = {
  id: 'user-2fa',
  email: 'user2fa@example.com',
  password: 'hashed',
  isActive: true,
  deletedAt: null,
  twoFactorSecret,
} as User;

const mockUserNo2FA = {
  id: 'user-no2fa',
  email: 'user@example.com',
  password: 'hashed',
  isActive: true,
  deletedAt: null,
  twoFactorSecret: null,
} as User;

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    updateLastLogin: jest.Mock;
  };
  let twoFactorService: {
    verify: jest.Mock;
    verifyBackupCode: jest.Mock;
    getStatus: jest.Mock;
  };
  let passwordService: { verify: jest.Mock };
  let sessionManager: { createSession: jest.Mock };
  let userEntityRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    userService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    twoFactorService = {
      verify: jest.fn(),
      verifyBackupCode: jest.fn(),
      getStatus: jest.fn(),
    };

    passwordService = { verify: jest.fn().mockResolvedValue(true) };

    sessionManager = {
      createSession: jest.fn().mockResolvedValue({
        tokens: { token: { token: 'access' }, refreshToken: { token: 'refresh' } },
        sessionId: 'session-1',
      }),
    };

    userEntityRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-2fa',
        email: 'user2fa@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: { name: 'CUSTOMER' },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        {
          provide: SessionService,
          useValue: {
            invalidateOne: jest.fn(),
            invalidateAll: jest.fn(),
            invalidateSessionsByDeviceInfo: jest.fn().mockResolvedValue(0),
            validateSessionOwnership: jest.fn().mockResolvedValue(true),
            updateSessionLastUsed: jest.fn(),
            listActive: jest.fn(),
          },
        },
        { provide: PasswordService, useValue: passwordService },
        { provide: UserProfileService, useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: AuthSessionManager, useValue: sessionManager },
        {
          provide: AuthMetadataService,
          useValue: { extractSessionMetadata: jest.fn().mockReturnValue({ deviceInfo: {} }) },
        },
        {
          provide: RateLimitService,
          useValue: { checkRateLimit: jest.fn(), clearRateLimit: jest.fn() },
        },
        { provide: ReferralService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: TwoFactorService, useValue: twoFactorService },
        { provide: getRepositoryToken(User), useValue: userEntityRepo },
        { provide: getRepositoryToken(Role), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login with 2FA', () => {
    it('throws UnauthorizedException with requires_2fa when user has 2FA and no totpCode', async () => {
      userService.findByEmail.mockResolvedValue(mockUserWith2FA);

      const dto: LoginUserDto = {
        email: 'user2fa@example.com',
        password: 'SecurePass123',
      };

      await expect(service.login(dto)).rejects.toMatchObject({
        response: {
          requires_2fa: true,
          message: 'TOTP code required',
        },
      });
    });

    it('returns tokens when user has 2FA and valid totpCode', async () => {
      userService.findByEmail.mockResolvedValue(mockUserWith2FA);
      twoFactorService.verify.mockResolvedValue(true);

      const dto: LoginUserDto = {
        email: 'user2fa@example.com',
        password: 'SecurePass123',
        totpCode: authenticator.generate(twoFactorSecret),
      };

      const result = await service.login(dto);

      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('sessionId');
      expect(twoFactorService.verify).toHaveBeenCalled();
      expect(sessionManager.createSession).toHaveBeenCalledWith('user-2fa', expect.any(Object));
    });

    it('throws UnauthorizedException when totpCode is invalid', async () => {
      userService.findByEmail.mockResolvedValue(mockUserWith2FA);
      twoFactorService.verify.mockResolvedValue(false);
      twoFactorService.verifyBackupCode.mockResolvedValue(false);

      const dto: LoginUserDto = {
        email: 'user2fa@example.com',
        password: 'SecurePass123',
        totpCode: '000000',
      };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(twoFactorService.verify).toHaveBeenCalled();
      expect(twoFactorService.verifyBackupCode).toHaveBeenCalledWith('user-2fa', '000000');
    });

    it('returns tokens when user has no 2FA without totpCode', async () => {
      userService.findByEmail.mockResolvedValue(mockUserNo2FA);

      const dto: LoginUserDto = {
        email: 'user@example.com',
        password: 'SecurePass123',
      };

      const result = await service.login(dto);

      expect(result).toHaveProperty('tokens');
      expect(twoFactorService.verify).not.toHaveBeenCalled();
    });
  });

  describe('2FA methods', () => {
    it('setup2fa throws UnauthorizedException when user not found', async () => {
      userEntityRepo.findOne.mockResolvedValue(null);

      await expect(service.setup2fa('non-existent-user')).rejects.toThrow(UnauthorizedException);
      expect(userEntityRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'non-existent-user', deletedAt: IsNull() }),
        }),
      );
    });

    it('verify2fa throws UnauthorizedException when user not found', async () => {
      userEntityRepo.findOne.mockResolvedValue(null);

      await expect(service.verify2fa('non-existent-user', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('get2faStatus throws UnauthorizedException when user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(service.get2faStatus('non-existent-user')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findById).toHaveBeenCalledWith('non-existent-user');
    });

    it('regenerateBackupCodes throws BadRequestException when 2FA is not enabled', async () => {
      userService.findById.mockResolvedValue(mockUserNo2FA);
      twoFactorService.getStatus.mockResolvedValue({
        enabled: false,
        method: null,
        backupCodesRemaining: 0,
      });

      await expect(service.regenerateBackupCodes('user-no2fa')).rejects.toThrow(
        BadRequestException,
      );
      expect(twoFactorService.getStatus).toHaveBeenCalled();
    });
  });

  describe('signUp / registerBusiness duplicate email', () => {
    it('signUp throws ConflictException when email already exists', async () => {
      userService.findByEmail.mockResolvedValueOnce({ id: 'existing' });

      await expect(
        service.signUp(
          { email: 'a@b.com', password: 'SecurePass123', firstName: 'A', lastName: 'B' },
          undefined,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('registerBusiness throws ConflictException when email already exists', async () => {
      userService.findByEmail.mockResolvedValueOnce({ id: 'existing' });

      await expect(
        service.registerBusiness(
          {
            email: 'a@b.com',
            password: 'SecurePass123',
            firstName: 'A',
            lastName: 'B',
            businessName: 'Biz',
          },
          undefined,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
});
