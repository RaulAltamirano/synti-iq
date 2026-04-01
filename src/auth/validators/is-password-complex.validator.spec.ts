import { validate } from 'class-validator';
import { IsPasswordComplex } from './is-password-complex.validator';

class PasswordDto {
  @IsPasswordComplex()
  password: string;
}

async function validatePasswordValue(password: unknown) {
  const dto = new PasswordDto();
  Object.assign(dto, { password });
  return validate(dto);
}

describe('IsPasswordComplex', () => {
  it.each([
    { password: 'Secure1a', description: 'upper, lower, and digit' },
    { password: 'Secure!aB', description: 'special char instead of digit' },
  ])('accepts password with $description', async ({ password }) => {
    const errors = await validatePasswordValue(password);
    expect(errors).toHaveLength(0);
  });

  it.each([
    { password: 'secure1ab', description: 'no uppercase' },
    { password: 'SECURE1AB', description: 'no lowercase' },
    { password: 'SecureAb', description: 'no digit or special' },
    { password: 123, description: 'non-string' },
  ])('rejects password with $description', async ({ password }) => {
    const errors = await validatePasswordValue(password);
    expect(errors.length).toBeGreaterThan(0);
  });
});
