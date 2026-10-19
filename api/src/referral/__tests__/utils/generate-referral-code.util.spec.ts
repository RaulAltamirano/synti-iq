import { generateUniqueReferralCode } from '../../utils/generate-referral-code.util';

const CODE_LENGTH = 8;

describe('generateUniqueReferralCode', () => {
  it('returns code of correct length when exists always returns false', async () => {
    const exists = jest.fn().mockResolvedValue(false);
    const code = await generateUniqueReferralCode(exists);
    expect(code).toHaveLength(CODE_LENGTH);
    expect(exists).toHaveBeenCalledTimes(1);
  });

  it('retries until exists returns false', async () => {
    const exists = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const code = await generateUniqueReferralCode(exists);
    expect(code).toHaveLength(CODE_LENGTH);
    expect(exists).toHaveBeenCalledTimes(3);
  });

  it('throws when exists always returns true up to MAX_ATTEMPTS', async () => {
    const exists = jest.fn().mockResolvedValue(true);
    await expect(generateUniqueReferralCode(exists)).rejects.toThrow(
      'Unable to generate unique referral code',
    );
    expect(exists).toHaveBeenCalledTimes(50);
  });

  it('returns alphanumeric code', async () => {
    const exists = jest.fn().mockResolvedValue(false);
    const code = await generateUniqueReferralCode(exists);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });
});
