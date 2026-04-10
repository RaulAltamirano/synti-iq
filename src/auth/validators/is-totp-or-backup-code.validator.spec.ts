import { validate } from 'class-validator';
import { IsTotpOrBackupCode } from './is-totp-or-backup-code.validator';

class CodeDto {
  @IsTotpOrBackupCode()
  code: string;
}

describe('IsTotpOrBackupCode', () => {
  it('accepts 6-digit TOTP', async () => {
    const dto = new CodeDto();
    dto.code = '123456';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts backup code XXXX-XXXX-XXXX', async () => {
    const dto = new CodeDto();
    dto.code = 'Ab12-cD34-eF56';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects wrong length TOTP', async () => {
    const dto = new CodeDto();
    dto.code = '12345';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects backup code with wrong separators', async () => {
    const dto = new CodeDto();
    dto.code = 'Ab12_cD34_eF56';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects non-string', async () => {
    const dto = new CodeDto();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invalid runtime input
    (dto as any).code = null;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
