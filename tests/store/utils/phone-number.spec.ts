import { describe, expect, it } from 'vitest';

import {
  buildE164Phone,
  parseE164Phone,
  sanitizeLocalDigits,
  validateE164Phone,
} from '@/modules/store/utils/phone-number';

describe('phone-number utils', () => {
  it('sanitizes local digits to max length', () => {
    expect(sanitizeLocalDigits('22-122-441-565', 10)).toBe('2212244156');
    expect(sanitizeLocalDigits('abc12345678901', 10)).toBe('1234567890');
  });

  it('parses Mexico E.164', () => {
    expect(parseE164Phone('+522212244156')).toEqual({ dial: '+52', local: '2212244156' });
  });

  it('builds Mexico E.164', () => {
    expect(buildE164Phone('+52', '2212244156')).toBe('+522212244156');
  });

  it('accepts empty phone', () => {
    expect(validateE164Phone('')).toBeNull();
    expect(validateE164Phone('   ')).toBeNull();
  });

  it('rejects incomplete Mexico number', () => {
    expect(validateE164Phone('+52221')).toBe('Enter 10 digits for Mexico');
  });

  it('accepts complete Mexico number', () => {
    expect(validateE164Phone('+522212244156')).toBeNull();
  });
});
