import type { ReferralStatsDto } from '../dto/referral-record.dto';

export function buildBenefitsDescription(
  trialDays?: number,
  discountPct?: number,
  variant: 'validation' | 'stats' = 'validation',
): string | undefined {
  const parts: string[] = [];
  if (trialDays && trialDays > 0) {
    parts.push(
      variant === 'stats'
        ? `${trialDays} extra days earned from referrals`
        : `${trialDays} days free trial`,
    );
  }
  if (discountPct && discountPct > 0) {
    parts.push(
      variant === 'stats'
        ? `${discountPct}% discount`
        : `${discountPct}% discount on first subscription`,
    );
  }
  return parts.length > 0 ? parts.join(' + ') : undefined;
}

export function buildReferralStatsBenefits(
  totalCount: number,
  trialBonus: number,
  discountPct: number,
): ReferralStatsDto['totalBenefitsEarned'] {
  if (trialBonus <= 0 && discountPct <= 0) return undefined;
  return {
    trialDays: trialBonus > 0 ? trialBonus * totalCount : undefined,
    discountPercentage: discountPct > 0 ? discountPct : undefined,
    description: buildBenefitsDescription(trialBonus * totalCount, discountPct, 'stats'),
  };
}
