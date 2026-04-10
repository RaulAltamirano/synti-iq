import { validate } from 'class-validator';
import { IsReferralCode } from './is-referral-code.validator';

class ReferralDto {
  @IsReferralCode()
  referralCode: string;
}

describe('IsReferralCode', () => {
  it('accepts 6-12 alphanumeric', async () => {
    const dto = new ReferralDto();
    dto.referralCode = 'abc123';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts mixed case', async () => {
    const dto = new ReferralDto();
    dto.referralCode = 'AbCdEf12';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects too short', async () => {
    const dto = new ReferralDto();
    dto.referralCode = 'abc12';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects too long', async () => {
    const dto = new ReferralDto();
    dto.referralCode = 'abcdefghijklm';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects non-alphanumeric', async () => {
    const dto = new ReferralDto();
    dto.referralCode = 'abc-123456';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
