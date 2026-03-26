import { validate } from 'class-validator';
import { IsPasswordComplex } from './is-password-complex.validator';

class PasswordDto {
  @IsPasswordComplex()
  password: string;
}

describe('IsPasswordComplex', () => {
  it('accepts password with upper, lower, and digit', async () => {
    const dto = new PasswordDto();
    dto.password = 'Secure1a';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts password with special char instead of digit', async () => {
    const dto = new PasswordDto();
    dto.password = 'Secure!aB';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects password without uppercase', async () => {
    const dto = new PasswordDto();
    dto.password = 'secure1ab';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects password without lowercase', async () => {
    const dto = new PasswordDto();
    dto.password = 'SECURE1AB';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects password without digit or special', async () => {
    const dto = new PasswordDto();
    dto.password = 'SecureAb';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects non-string', async () => {
    const dto = new PasswordDto();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invalid runtime input
    (dto as any).password = 123;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
