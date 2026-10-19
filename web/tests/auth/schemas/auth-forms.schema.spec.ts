import { describe, expect, it } from 'vitest';

import {
  loginCredentialsSchema,
  registerBusinessSchema,
  registerCustomerSchema,
  setPasswordFormSchema,
} from '@/modules/auth/schemas/auth-forms.schema';

describe('loginCredentialsSchema', () => {
  it('rejects empty or invalid email', () => {
    expect(loginCredentialsSchema.safeParse({ email: '', password: 'Aa1aaaa' }).success).toBe(
      false
    );
    expect(loginCredentialsSchema.safeParse({ email: 'bad', password: 'Aa1aaaa' }).success).toBe(
      false
    );
  });

  it('rejects weak password', () => {
    expect(loginCredentialsSchema.safeParse({ email: 'a@b.co', password: 'short' }).success).toBe(
      false
    );
  });

  it('accepts valid pair', () => {
    const r = loginCredentialsSchema.safeParse({ email: 'a@b.co', password: 'Aa1aaaaa' });
    expect(r.success).toBe(true);
  });
});

describe('registerCustomerSchema', () => {
  it('requires name length', () => {
    expect(
      registerCustomerSchema.safeParse({
        firstName: 'A',
        lastName: 'Smith',
        email: 'a@b.co',
        password: 'Aa1aaaaa',
      }).success
    ).toBe(false);
  });

  it('accepts valid payload', () => {
    const r = registerCustomerSchema.safeParse({
      firstName: 'Ann',
      lastName: 'Smith',
      email: 'a@b.co',
      password: 'Aa1aaaaa',
    });
    expect(r.success).toBe(true);
  });
});

describe('setPasswordFormSchema', () => {
  it('rejects mismatch', () => {
    expect(
      setPasswordFormSchema.safeParse({
        password: 'Aa1aaaaa',
        confirmPassword: 'Aa1aaaaa!',
      }).success
    ).toBe(false);
  });

  it('accepts matching strong passwords', () => {
    const r = setPasswordFormSchema.safeParse({
      password: 'Aa1aaaaa',
      confirmPassword: 'Aa1aaaaa',
    });
    expect(r.success).toBe(true);
  });
});

describe('registerBusinessSchema', () => {
  it('requires business name', () => {
    expect(
      registerBusinessSchema.safeParse({
        firstName: 'Ann',
        lastName: 'Smith',
        businessName: '',
        email: 'a@b.co',
        password: 'Aa1aaaaa',
      }).success
    ).toBe(false);
  });

  it('accepts valid payload', () => {
    const r = registerBusinessSchema.safeParse({
      firstName: 'Ann',
      lastName: 'Smith',
      businessName: 'Acme',
      email: 'a@b.co',
      password: 'Aa1aaaaa',
    });
    expect(r.success).toBe(true);
  });
});
