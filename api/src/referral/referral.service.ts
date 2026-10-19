import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ReferralCode } from './entities/referral_code.entity';
import { ReferralUsage } from './entities/referral_usage.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { User } from 'src/user/entities/user.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { generateUniqueReferralCode } from './utils/generate-referral-code.util';
import { formatUserName } from './utils/format-user-name.util';
import { buildReferralStatsBenefits } from './utils/referral-benefits.util';
import {
  buildValidValidationResponse,
  mapUsagesToReferralRecords,
} from './utils/referral-dto.util';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { ReferralValidationResponseDto } from './dto/referral-validation-response.dto';
import { MyReferralCodeDto } from './dto/my-referral-code.dto';
import { MyReferrerResponseDto } from './dto/referrer-info.dto';
import { ReferralStatsDto } from './dto/referral-record.dto';
import { MyReferralsPaginatedDto } from './dto/my-referrals-paginated.dto';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { ReferralMetricsService } from './services/referral-metrics.service';
import { REFERRAL_SPAN_NAMES, REFERRAL_SPAN_ATTRIBUTES } from './constants';

const REFERRAL_CODE_REGEX = /^[A-Z0-9]{6,12}$/i;
const MSG_INVALID_REFERRAL_CODE = 'Invalid or expired referral code';
const MSG_BUSINESS_OWNER_REQUIRED = 'Only business owners can access';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectRepository(ReferralCode)
    private readonly referralCodeRepository: Repository<ReferralCode>,
    @InjectRepository(ReferralUsage)
    private readonly referralUsageRepository: Repository<ReferralUsage>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userProfileService: UserProfileService,
    private readonly observabilityService: ObservabilityService,
    private readonly referralMetrics: ReferralMetricsService,
  ) {}

  async validateCode(code: string): Promise<ReferralValidationResponseDto> {
    return this.observabilityService.withSpan(REFERRAL_SPAN_NAMES.VALIDATE_CODE, async span => {
      const result = await this.computeValidationResult(code);
      const sanitizedCode = code?.trim().toUpperCase();
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.CODE_LENGTH, sanitizedCode?.length ?? 0);
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.IS_VALID, result.isValid);
      if (result.isValid && result.referralCodeId) {
        span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.REFERRAL_CODE_ID, result.referralCodeId);
      }
      return result;
    });
  }

  private async computeValidationResult(code: string): Promise<ReferralValidationResponseDto> {
    const sanitizedCode = code?.trim().toUpperCase();
    if (!sanitizedCode || !REFERRAL_CODE_REGEX.test(sanitizedCode)) {
      this.referralMetrics.recordValidation('invalid_format');
      this.logger.debug('Referral code validation failed: invalid format', ReferralService.name);
      return {
        isValid: false,
        errorMessage: !code?.trim()
          ? 'Referral code is required'
          : 'Invalid referral code format. Code must be 6-12 alphanumeric characters.',
      };
    }

    const referralCode = await this.referralCodeRepository.findOne({
      where: { code: sanitizedCode },
      relations: ['businessProfile'],
    });

    if (!referralCode) {
      this.referralMetrics.recordValidation('not_found');
      this.logger.debug('Referral code not found', ReferralService.name);
      return { isValid: false, errorMessage: MSG_INVALID_REFERRAL_CODE };
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: {
        profileType: SystemRole.BUSINESS_OWNER,
        profileId: referralCode.businessProfileId,
      },
    });

    if (!userProfile) {
      this.referralMetrics.recordValidation('no_profile');
      this.logger.warn(
        'Referral code valid but business owner profile missing',
        ReferralService.name,
      );
      return { isValid: false, errorMessage: MSG_INVALID_REFERRAL_CODE };
    }

    const user = await this.userRepository.findOne({
      where: { id: userProfile.userId },
      select: ['id', 'firstName', 'lastName', 'email'],
    });

    this.referralMetrics.recordValidation('valid');
    return buildValidValidationResponse(referralCode, user);
  }

  async recordUsage(
    referralCodeId: string,
    referredUserId: string,
    referredBusinessProfileId: string,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    return this.observabilityService.withSpan(REFERRAL_SPAN_NAMES.RECORD_USAGE, async span => {
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.REFERRAL_CODE_ID, referralCodeId);
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.REFERRED_USER_ID, referredUserId);
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.BUSINESS_PROFILE_ID, referredBusinessProfileId);

      const usage = this.referralUsageRepository.create({
        referralCodeId,
        referredUserId,
        referredBusinessProfileId,
      });
      const manager = queryRunner?.manager ?? this.referralUsageRepository.manager;
      await manager.save(ReferralUsage, usage);
      this.referralMetrics.recordUsage();
      this.logger.log('Referral usage recorded', ReferralService.name);
    });
  }

  async findByBusinessProfileId(
    businessProfileId: string,
    queryRunner?: QueryRunner,
  ): Promise<ReferralCode | null> {
    const manager = queryRunner?.manager ?? this.referralCodeRepository.manager;
    return manager.findOne(ReferralCode, { where: { businessProfileId } });
  }

  async createCode(businessProfileId: string, queryRunner?: QueryRunner): Promise<ReferralCode> {
    return this.observabilityService.withSpan(REFERRAL_SPAN_NAMES.CREATE_CODE, async span => {
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.BUSINESS_PROFILE_ID, businessProfileId);

      const manager = queryRunner?.manager ?? this.referralCodeRepository.manager;
      const code = await generateUniqueReferralCode(c =>
        manager.findOne(ReferralCode, { where: { code: c } }).then(Boolean),
      );
      const referralCode = this.referralCodeRepository.create({
        code,
        businessProfileId,
        trialDaysBonus: 0,
        discountPercentage: 0,
      });
      const saved = await manager.save(ReferralCode, referralCode);
      this.referralMetrics.recordCodeGeneration();
      this.logger.log('Referral code created for business profile', ReferralService.name);
      return saved;
    });
  }

  async ensureCodeForBusinessProfile(
    businessProfileId: string,
    queryRunner?: QueryRunner,
  ): Promise<ReferralCode> {
    const existing = await this.findByBusinessProfileId(businessProfileId, queryRunner);
    if (existing) return existing;
    return this.createCode(businessProfileId, queryRunner);
  }

  private async getBusinessOwnerProfileOrThrow(
    userId: string,
    resource: string,
  ): Promise<{ profileId: string }> {
    const profile = await this.userProfileService.getUserProfile(userId);
    if (!profile || profile.profileType !== SystemRole.BUSINESS_OWNER || !profile.profileId) {
      this.logger.warn('Access denied: business owner role required', ReferralService.name);
      throw new ForbiddenException(`${MSG_BUSINESS_OWNER_REQUIRED} ${resource}`);
    }
    return { profileId: profile.profileId };
  }

  async getMyCode(userId: string): Promise<MyReferralCodeDto> {
    return this.observabilityService.withSpan(REFERRAL_SPAN_NAMES.GET_MY_CODE, async span => {
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.USER_ID, userId);
      const { profileId } = await this.getBusinessOwnerProfileOrThrow(userId, 'referral codes');
      const referralCode = await this.ensureCodeForBusinessProfile(profileId);
      const totalUsageCount = await this.referralUsageRepository.count({
        where: { referralCodeId: referralCode.id },
      });
      return {
        code: referralCode.code,
        createdAt: referralCode.createdAt,
        totalUsageCount,
      };
    });
  }

  async getMyReferrer(userId: string): Promise<MyReferrerResponseDto> {
    return this.observabilityService.withSpan(REFERRAL_SPAN_NAMES.GET_MY_REFERRER, async span => {
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.USER_ID, userId);
      return this.computeMyReferrer(userId);
    });
  }

  private async computeMyReferrer(userId: string): Promise<MyReferrerResponseDto> {
    const profile = await this.userProfileService.getUserProfile(userId);
    const businessProfileId =
      profile?.profileType === SystemRole.BUSINESS_OWNER ? profile.profileId : null;

    const usageQuery = this.referralUsageRepository
      .createQueryBuilder('usage')
      .where('usage.referredUserId = :userId', { userId });

    if (businessProfileId) {
      usageQuery.orWhere('usage.referredBusinessProfileId = :businessProfileId', {
        businessProfileId,
      });
    }

    const usage = await usageQuery.orderBy('usage.createdAt', 'ASC').limit(1).getOne();
    if (!usage) return { referrer: null };

    const referralCode = await this.referralCodeRepository.findOne({
      where: { id: usage.referralCodeId },
      relations: ['businessProfile'],
    });
    if (!referralCode) return { referrer: null };

    const referrerUserProfile = await this.userProfileRepository.findOne({
      where: {
        profileType: SystemRole.BUSINESS_OWNER,
        profileId: referralCode.businessProfileId,
      },
    });
    if (!referrerUserProfile) return { referrer: null };

    const referrerUser = await this.userRepository.findOne({
      where: { id: referrerUserProfile.userId },
      select: ['id', 'firstName', 'lastName', 'email'],
    });
    if (!referrerUser) return { referrer: null };

    return {
      referrer: {
        id: referrerUser.id,
        fullName: formatUserName(referrerUser.firstName, referrerUser.lastName),
        email: referrerUser.email ?? '',
        referredAt: usage.createdAt,
      },
    };
  }

  async getMyReferralsStats(userId: string): Promise<ReferralStatsDto> {
    return this.observabilityService.withSpan(
      REFERRAL_SPAN_NAMES.GET_MY_REFERRALS_STATS,
      async span => {
        const result = await this.computeReferralStats(userId);
        span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.USER_ID, userId);
        span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.TOTAL_ITEMS, result.totalReferrals);
        return result;
      },
    );
  }

  private async computeReferralStats(userId: string): Promise<ReferralStatsDto> {
    const { profileId } = await this.getBusinessOwnerProfileOrThrow(userId, 'referral stats');
    const referralCode = await this.findByBusinessProfileId(profileId);
    if (!referralCode) {
      return { totalReferrals: 0, successfulReferrals: 0, pendingReferrals: 0 };
    }

    const totalCount = await this.referralUsageRepository.count({
      where: { referralCodeId: referralCode.id },
    });

    const trialBonus = Number(referralCode.trialDaysBonus) || 0;
    const discountPct = Number(referralCode.discountPercentage) || 0;
    const totalBenefitsEarned = buildReferralStatsBenefits(totalCount, trialBonus, discountPct);

    return {
      totalReferrals: totalCount,
      successfulReferrals: totalCount,
      pendingReferrals: 0,
      totalBenefitsEarned,
    };
  }

  async getMyReferrals(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<MyReferralsPaginatedDto> {
    return this.observabilityService.withSpan(REFERRAL_SPAN_NAMES.GET_MY_REFERRALS, async span => {
      const result = await this.fetchMyReferralsPaginated(userId, page, limit);
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.USER_ID, userId);
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.PAGE, result.page);
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.LIMIT, result.limit);
      span.setAttribute(REFERRAL_SPAN_ATTRIBUTES.TOTAL_ITEMS, result.total);
      return result;
    });
  }

  private async fetchMyReferralsPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<MyReferralsPaginatedDto> {
    const { profileId } = await this.getBusinessOwnerProfileOrThrow(userId, 'referral list');
    const referralCode = await this.findByBusinessProfileId(profileId);
    if (!referralCode) {
      return {
        items: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;

    const [usages, total] = await this.referralUsageRepository.findAndCount({
      where: { referralCodeId: referralCode.id },
      relations: ['referredUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });

    const items = mapUsagesToReferralRecords(usages);

    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      items,
      total,
      page: safePage,
      totalPages,
      limit: safeLimit,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    };
  }
}
