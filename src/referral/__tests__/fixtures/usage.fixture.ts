import type { ReferralUsage } from '../../entities/referral_usage.entity';

export interface ReferralUsageFixtureOverrides {
  id?: string;
  referralCodeId?: string;
  referredUserId?: string;
  referredBusinessProfileId?: string;
  referredUser?: unknown | null;
  createdAt?: Date;
}

/** Tipo relajado para fixtures de test (referredUser puede ser parcial o null) */
export type ReferralUsageFixture = Omit<Partial<ReferralUsage>, 'referredUser'> & {
  referredUser?: Partial<ReferralUsage['referredUser']> | null;
};

/**
 * Fixture base para ReferralUsage.
 */
export function createReferralUsageFixture(
  overrides: ReferralUsageFixtureOverrides = {},
): ReferralUsageFixture {
  return {
    id: 'usage-1',
    referralCodeId: 'code-1',
    referredUserId: 'u-1',
    referredBusinessProfileId: 'bp-1',
    createdAt: new Date('2024-01-15'),
    ...overrides,
  } as ReferralUsageFixture;
}
