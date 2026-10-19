import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UserRegistrationService } from './user-registration.service';
import { UserService } from 'src/user/user.service';
import { PasswordService } from 'src/password/password.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { DataSource } from 'typeorm';
import { AuthSessionManager } from './auth-session-manager.service';
import { AuthMetadataService } from './auth-metadata.service';
import { ReferralService } from 'src/referral/referral.service';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { createMockObservabilityService } from 'src/auth/__tests__/mocks';

function createQueryRunnerMock() {
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      save: jest.fn(),
      create: jest.fn((_entity: unknown, data: Record<string, unknown>) => data),
    },
  };
}

describe('UserRegistrationService', () => {
  let service: UserRegistrationService;
  let userService: { findByEmail: jest.Mock };
  let dataSource: { createQueryRunner: jest.Mock };
  let roleRepository: { findOne: jest.Mock };
  let userEntityRepository: { create: jest.Mock };

  beforeEach(async () => {
    const qr = createQueryRunnerMock();
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(qr),
    };

    userService = {
      findByEmail: jest.fn(),
    };

    roleRepository = {
      findOne: jest.fn(),
    };

    userEntityRepository = {
      create: jest.fn((data: Record<string, unknown>) => data),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRegistrationService,
        { provide: UserService, useValue: userService },
        { provide: PasswordService, useValue: { hash: jest.fn().mockResolvedValue('hashed') } },
        {
          provide: UserProfileService,
          useValue: {
            createProfileForUser: jest.fn(),
            validateProfileCoherence: jest.fn(),
          },
        },
        { provide: DataSource, useValue: dataSource },
        {
          provide: AuthSessionManager,
          useValue: {
            createSession: jest.fn().mockResolvedValue({
              tokens: { token: { token: 'a' }, refreshToken: { token: 'r' } },
              sessionId: 'sid-1',
            }),
          },
        },
        {
          provide: AuthMetadataService,
          useValue: { extractSessionMetadata: jest.fn().mockReturnValue({ lastUsed: new Date() }) },
        },
        {
          provide: ReferralService,
          useValue: {
            validateCode: jest.fn(),
            recordUsage: jest.fn(),
            ensureCodeForBusinessProfile: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: { sendWelcomeBusiness: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: getRepositoryToken(User), useValue: userEntityRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        { provide: ObservabilityService, useValue: createMockObservabilityService() },
      ],
    }).compile();

    service = module.get(UserRegistrationService);
    jest.clearAllMocks();
    dataSource.createQueryRunner.mockReturnValue(createQueryRunnerMock());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signUp throws ConflictException when email already exists', async () => {
    userService.findByEmail.mockResolvedValue({ id: 'x' });

    await expect(
      service.signUp({
        email: 'taken@example.com',
        password: 'SecurePass123',
        firstName: 'A',
        lastName: 'B',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('registerBusiness throws ConflictException when email already exists', async () => {
    userService.findByEmail.mockResolvedValue({ id: 'x' });

    await expect(
      service.registerBusiness({
        email: 'taken@example.com',
        password: 'SecurePass123',
        firstName: 'A',
        lastName: 'B',
        businessName: 'Co',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('signUp rolls back transaction when CUSTOMER role is missing', async () => {
    userService.findByEmail.mockResolvedValue(null);
    roleRepository.findOne.mockResolvedValue(null);
    const qr = createQueryRunnerMock();
    dataSource.createQueryRunner.mockReturnValue(qr);

    await expect(
      service.signUp({
        email: 'new@example.com',
        password: 'SecurePass123',
        firstName: 'A',
        lastName: 'B',
      }),
    ).rejects.toThrow(InternalServerErrorException);

    expect(qr.rollbackTransaction).toHaveBeenCalled();
    expect(qr.release).toHaveBeenCalled();
  });
});
