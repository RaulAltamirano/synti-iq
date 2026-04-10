import type { User } from 'src/user/entities/user.entity';
import type { ReferralValidationResponseDto } from '../dto/referral-validation-response.dto';
import type { ReferralRecordDto } from '../dto/referral-record.dto';
import { formatUserName } from './format-user-name.util';
import { buildBenefitsDescription } from './referral-benefits.util';

export function buildValidValidationResponse(
  referralCode: { id: string; trialDaysBonus: number; discountPercentage: number },
  user: { firstName?: string; lastName?: string; email?: string } | null,
): ReferralValidationResponseDto {
  const trialDays = referralCode.trialDaysBonus > 0 ? referralCode.trialDaysBonus : undefined;
  const discountPct =
    Number(referralCode.discountPercentage) > 0
      ? Number(referralCode.discountPercentage)
      : undefined;
  const description = buildBenefitsDescription(trialDays, discountPct, 'validation');
  return {
    isValid: true,
    referrerName: user ? formatUserName(user.firstName, user.lastName) : 'Unknown',
    referrerEmail: user?.email,
    benefits:
      trialDays || discountPct
        ? { trialDays, discountPercentage: discountPct, description }
        : undefined,
    referralCodeId: referralCode.id,
  };
}

export function mapUsagesToReferralRecords(
  usages: Array<{ referredUserId: string; createdAt: Date; referredUser?: User | null }>,
): ReferralRecordDto[] {
  return usages.map(usage => {
    const user = usage.referredUser;
    return {
      userId: usage.referredUserId,
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email,
      registeredAt: usage.createdAt,
      status: 'active' as const,
    };
  });
}
