import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, Logger } from '@nestjs/common';
import { ReferralService } from '../referral.service';
import { ReferralCode } from '../entities/referral_code.entity';
import { ReferralUsage } from '../entities/referral_usage.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { User } from 'src/user/entities/user.entity';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { ReferralMetricsService } from '../services/referral-metrics.service';
import {
  SPAN_REFERRAL_VALIDATE_CODE,
  SPAN_REFERRAL_RECORD_USAGE,
  SPAN_REFERRAL_GET_MY_CODE,
} from '../constants';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { createMockObservabilityService, createMockReferralMetricsService } from './mocks';
import {
  createReferralCodeFixture,
  createUserFixture,
  createUserProfileFixture,
  createReferralUsageFixture,
} from './fixtures';

const mockObservabilityService = createMockObservabilityService();
const mockReferralMetricsService = createMockReferralMetricsService();

describe('ReferralService', () => {
  let service: ReferralService;
  let referralCodeRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    manager: { findOne: jest.Mock; save: jest.Mock };
  };
  let referralUsageRepository: {
    count: jest.Mock;
    create: jest.Mock;
    findAndCount: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: { findOne: jest.Mock; save: jest.Mock };
  };
  let userProfileRepository: { findOne: jest.Mock };
  let userRepository: { findOne: jest.Mock };
  let userProfileService: { getUserProfile: jest.Mock };

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();

    referralCodeRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      manager: mockManager,
    } as any;

    referralUsageRepository = {
      count: jest.fn(),
      create: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: mockManager,
    } as any;

    userProfileRepository = { findOne: jest.fn() };
    userRepository = { findOne: jest.fn() };
    userProfileService = { getUserProfile: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        { provide: getRepositoryToken(ReferralCode), useValue: referralCodeRepository },
        { provide: getRepositoryToken(ReferralUsage), useValue: referralUsageRepository },
        { provide: getRepositoryToken(UserProfile), useValue: userProfileRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: ObservabilityService, useValue: mockObservabilityService },
        { provide: ReferralMetricsService, useValue: mockReferralMetricsService },
      ],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCode', () => {
    it('returns isValid false when code is empty', async () => {
      const result = await service.validateCode('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Referral code is required');
      expect(referralCodeRepository.findOne).not.toHaveBeenCalled();
    });

    it('returns isValid false when code has invalid format', async () => {
      const result = await service.validateCode('abc'); // less than 6 chars
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid referral code format');
      expect(referralCodeRepository.findOne).not.toHaveBeenCalled();
    });

    it('returns isValid false when code not found in database', async () => {
      referralCodeRepository.findOne.mockResolvedValue(null);

      const result = await service.validateCode('INVALID1');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid or expired referral code');
      expect(referralCodeRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'INVALID1' },
        relations: ['businessProfile'],
      });
    });

    it('returns isValid false when userProfile not found for referral code', async () => {
      referralCodeRepository.findOne.mockResolvedValue(
        createReferralCodeFixture({ id: 'code-id' }),
      );
      userProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.validateCode('valid12');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid or expired referral code');
    });

    it('returns isValid true with referrer info and benefits when code is valid', async () => {
      referralCodeRepository.findOne.mockResolvedValue(createReferralCodeFixture());
      userProfileRepository.findOne.mockResolvedValue(createUserProfileFixture());
      userRepository.findOne.mockResolvedValue(createUserFixture());

      const result = await service.validateCode('valid12');

      expect(result.isValid).toBe(true);
      expect(result.referrerName).toBe('John Doe');
      expect(result.referrerEmail).toBe('john@example.com');
      expect(result.referralCodeId).toBe('ref-code-id');
      expect(result.benefits).toEqual({
        trialDays: 7,
        discountPercentage: 10,
        description: expect.stringContaining('7 days free trial'),
      });
    });

    it('calls observabilityService.withSpan with SPAN_REFERRAL_VALIDATE_CODE when validating', async () => {
      referralCodeRepository.findOne.mockResolvedValue(null);

      await service.validateCode('VALID12');

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_REFERRAL_VALIDATE_CODE,
        expect.any(Function),
      );
    });

    it('calls referralMetrics.recordValidation with invalid_format when code has invalid format', async () => {
      await service.validateCode('abc');

      expect(mockReferralMetricsService.recordValidation).toHaveBeenCalledWith('invalid_format');
    });

    it('calls referralMetrics.recordValidation with not_found when code not found', async () => {
      referralCodeRepository.findOne.mockResolvedValue(null);

      await service.validateCode('INVALID1');

      expect(mockReferralMetricsService.recordValidation).toHaveBeenCalledWith('not_found');
    });

    it('calls referralMetrics.recordValidation with valid when code is valid', async () => {
      referralCodeRepository.findOne.mockResolvedValue(createReferralCodeFixture());
      userProfileRepository.findOne.mockResolvedValue(createUserProfileFixture());
      userRepository.findOne.mockResolvedValue(createUserFixture());

      await service.validateCode('valid12');

      expect(mockReferralMetricsService.recordValidation).toHaveBeenCalledWith('valid');
    });
  });

  describe('getMyCode', () => {
    it('throws ForbiddenException when user has no profile', async () => {
      userProfileService.getUserProfile.mockResolvedValue(null);

      await expect(service.getMyCode('user-id')).rejects.toThrow(ForbiddenException);
      await expect(service.getMyCode('user-id')).rejects.toThrow(
        'Only business owners can access referral codes',
      );
    });

    it('throws ForbiddenException when user is not business owner', async () => {
      userProfileService.getUserProfile.mockResolvedValue(
        createUserProfileFixture({ profileType: SystemRole.CUSTOMER, profileId: null }),
      );

      await expect(service.getMyCode('user-id')).rejects.toThrow(ForbiddenException);
    });

    it('returns MyReferralCodeDto when business owner has existing code', async () => {
      userProfileService.getUserProfile.mockResolvedValue(createUserProfileFixture());
      mockManager.findOne.mockResolvedValue(
        createReferralCodeFixture({ id: 'ref-id', code: 'ABC12345' }),
      );
      referralUsageRepository.count.mockResolvedValue(5);

      const result = await service.getMyCode('user-id');

      expect(result.code).toBe('ABC12345');
      expect(result.totalUsageCount).toBe(5);
      expect(result.createdAt).toEqual(new Date('2024-01-01'));
    });
  });

  describe('getMyReferrer', () => {
    it('returns referrer null when no usage found', async () => {
      userProfileService.getUserProfile.mockResolvedValue(
        createUserProfileFixture({ profileType: SystemRole.CUSTOMER }),
      );
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      referralUsageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getMyReferrer('user-id');

      expect(result.referrer).toBeNull();
    });
  });

  describe('getMyReferralsStats', () => {
    it('returns zeros when no referral code exists', async () => {
      userProfileService.getUserProfile.mockResolvedValue(createUserProfileFixture());
      mockManager.findOne.mockResolvedValue(null); // findByBusinessProfileId

      const result = await service.getMyReferralsStats('user-id');

      expect(result.totalReferrals).toBe(0);
      expect(result.successfulReferrals).toBe(0);
      expect(result.pendingReferrals).toBe(0);
    });

    it('throws ForbiddenException when not business owner', async () => {
      userProfileService.getUserProfile.mockResolvedValue(null);

      await expect(service.getMyReferralsStats('user-id')).rejects.toThrow(ForbiddenException);
      await expect(service.getMyReferralsStats('user-id')).rejects.toThrow(
        'Only business owners can access referral stats',
      );
    });
  });

  describe('recordUsage', () => {
    it('saves ReferralUsage with correct data', async () => {
      const mockUsage = createReferralUsageFixture();
      referralUsageRepository.create.mockReturnValue(mockUsage);
      mockManager.save.mockResolvedValue(mockUsage);

      await service.recordUsage('code-1', 'u-1', 'bp-1');

      expect(referralUsageRepository.create).toHaveBeenCalledWith({
        referralCodeId: 'code-1',
        referredUserId: 'u-1',
        referredBusinessProfileId: 'bp-1',
      });
      expect(mockManager.save).toHaveBeenCalledWith(ReferralUsage, mockUsage);
    });
  });

  describe('instrumentation', () => {
    it('validateCode invokes withSpan with VALIDATE_CODE and recordValidation for valid code', async () => {
      referralCodeRepository.findOne.mockResolvedValue(createReferralCodeFixture());
      userProfileRepository.findOne.mockResolvedValue(createUserProfileFixture());
      userRepository.findOne.mockResolvedValue(createUserFixture());

      await service.validateCode('valid12');

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_REFERRAL_VALIDATE_CODE,
        expect.any(Function),
      );
      expect(mockReferralMetricsService.recordValidation).toHaveBeenCalledWith('valid');
    });

    it('validateCode invokes recordValidation invalid_format for invalid format', async () => {
      await service.validateCode('abc');

      expect(mockReferralMetricsService.recordValidation).toHaveBeenCalledWith('invalid_format');
    });

    it('validateCode invokes recordValidation not_found when code not in database', async () => {
      referralCodeRepository.findOne.mockResolvedValue(null);

      await service.validateCode('INVALID1');

      expect(mockReferralMetricsService.recordValidation).toHaveBeenCalledWith('not_found');
    });

    it('recordUsage invokes withSpan with RECORD_USAGE and recordUsage after save', async () => {
      const mockUsage = createReferralUsageFixture();
      referralUsageRepository.create.mockReturnValue(mockUsage);
      mockManager.save.mockResolvedValue(mockUsage);

      await service.recordUsage('code-1', 'u-1', 'bp-1');

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_REFERRAL_RECORD_USAGE,
        expect.any(Function),
      );
      expect(mockReferralMetricsService.recordUsage).toHaveBeenCalled();
    });

    it('getMyCode invokes withSpan with GET_MY_CODE', async () => {
      userProfileService.getUserProfile.mockResolvedValue(createUserProfileFixture());
      mockManager.findOne.mockResolvedValue(
        createReferralCodeFixture({ id: 'ref-id', code: 'ABC12345' }),
      );
      referralUsageRepository.count.mockResolvedValue(5);

      await service.getMyCode('user-id');

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_REFERRAL_GET_MY_CODE,
        expect.any(Function),
      );
    });

    it('propagates ForbiddenException when getMyCode user is not business owner', async () => {
      userProfileService.getUserProfile.mockResolvedValue(null);

      await expect(service.getMyCode('user-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
