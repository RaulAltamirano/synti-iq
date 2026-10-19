import {
  buildBenefitsDescription,
  buildReferralStatsBenefits,
} from '../../utils/referral-benefits.util';

describe('buildBenefitsDescription', () => {
  it('returns undefined when both values are zero or undefined', () => {
    expect(buildBenefitsDescription(0, 0)).toBeUndefined();
    expect(buildBenefitsDescription(undefined, undefined)).toBeUndefined();
  });

  it('formats validation variant with trial days', () => {
    expect(buildBenefitsDescription(7, 0, 'validation')).toBe('7 days free trial');
  });

  it('formats stats variant with trial days', () => {
    expect(buildBenefitsDescription(14, 0, 'stats')).toContain(
      '14 extra days earned from referrals',
    );
  });

  it('formats with discount for validation', () => {
    expect(buildBenefitsDescription(0, 10, 'validation')).toContain(
      '10% discount on first subscription',
    );
  });

  it('combines trial and discount', () => {
    const result = buildBenefitsDescription(7, 10, 'validation');
    expect(result).toContain('7 days free trial');
    expect(result).toContain('10%');
  });
});

describe('buildReferralStatsBenefits', () => {
  it('returns undefined when trialBonus and discountPct are zero', () => {
    expect(buildReferralStatsBenefits(5, 0, 0)).toBeUndefined();
  });

  it('returns benefits with trialDays when trialBonus > 0', () => {
    const result = buildReferralStatsBenefits(3, 7, 0);
    expect(result?.trialDays).toBe(21);
    expect(result?.discountPercentage).toBeUndefined();
    expect(result?.description).toBeDefined();
  });

  it('returns benefits with discount when discountPct > 0', () => {
    const result = buildReferralStatsBenefits(2, 0, 15);
    expect(result?.discountPercentage).toBe(15);
    expect(result?.trialDays).toBeUndefined();
  });
});
