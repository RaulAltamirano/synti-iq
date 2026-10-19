import {
  buildValidValidationResponse,
  mapUsagesToReferralRecords,
} from '../../utils/referral-dto.util';

describe('buildValidValidationResponse', () => {
  it('returns valid response with user info', () => {
    const referralCode = {
      id: 'code-123',
      trialDaysBonus: 7,
      discountPercentage: 10,
    };
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const result = buildValidValidationResponse(referralCode, user);

    expect(result.isValid).toBe(true);
    expect(result.referrerName).toBe('John Doe');
    expect(result.referrerEmail).toBe('john@example.com');
    expect(result.referralCodeId).toBe('code-123');
    expect(result.benefits?.trialDays).toBe(7);
    expect(result.benefits?.discountPercentage).toBe(10);
  });

  it('returns "Unknown" for referrerName when user is null', () => {
    const referralCode = { id: 'x', trialDaysBonus: 0, discountPercentage: 0 };
    const result = buildValidValidationResponse(referralCode, null);
    expect(result.referrerName).toBe('Unknown');
  });

  it('returns undefined benefits when no trial or discount', () => {
    const referralCode = { id: 'x', trialDaysBonus: 0, discountPercentage: 0 };
    const result = buildValidValidationResponse(referralCode, { firstName: 'J' });
    expect(result.benefits).toBeUndefined();
  });
});

describe('mapUsagesToReferralRecords', () => {
  it('maps usages to ReferralRecordDto array', () => {
    const usages = [
      {
        referredUserId: 'u-1',
        createdAt: new Date('2024-01-15'),
        referredUser: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
        } as any,
      },
    ];

    const result = mapUsagesToReferralRecords(usages);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      userId: 'u-1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      registeredAt: new Date('2024-01-15'),
      status: 'active',
    });
  });

  it('handles usage with null referredUser', () => {
    const usages = [
      {
        referredUserId: 'u-2',
        createdAt: new Date('2024-01-16'),
        referredUser: null,
      },
    ];

    const result = mapUsagesToReferralRecords(usages);

    expect(result[0].firstName).toBe('');
    expect(result[0].lastName).toBe('');
    expect(result[0].email).toBeUndefined();
  });
});
