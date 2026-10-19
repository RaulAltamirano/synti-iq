import type { ReferralCode } from '../../entities/referral_code.entity';

export interface ReferralCodeFixtureOverrides {
  id?: string;
  code?: string;
  businessProfileId?: string;
  trialDaysBonus?: number;
  discountPercentage?: number;
  createdAt?: Date;
}

/**
 * Fixture base para ReferralCode.
 * Usa spread para permitir overrides por test.
 */
export function createReferralCodeFixture(
  overrides: ReferralCodeFixtureOverrides = {},
): Partial<ReferralCode> {
  return {
    id: 'ref-code-id',
    code: 'VALID12',
    businessProfileId: 'bp-id',
    trialDaysBonus: 7,
    discountPercentage: 10,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
