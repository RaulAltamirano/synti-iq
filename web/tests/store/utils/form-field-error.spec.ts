import { describe, expect, it } from 'vitest';

import {
  getFieldError,
  hasFieldError,
  toFieldErrorProps,
} from '@/modules/store/utils/form-field-error';

describe('form-field-error utils', () => {
  it('reads flat and nested validation errors', () => {
    const errors = {
      name: 'Required',
      location: {
        name: 'Too short',
        street: 'Required',
      },
    };

    expect(getFieldError(errors, 'name')).toBe('Required');
    expect(getFieldError(errors, 'location.name')).toBe('Too short');
    expect(getFieldError(errors, 'location.city')).toBe('');
  });

  it('detects whether a field has an error', () => {
    const errors = { email: 'Invalid email' };
    expect(hasFieldError(errors, 'email')).toBe(true);
    expect(hasFieldError(errors, 'name')).toBe(false);
  });

  it('maps vee-validate messages to input props', () => {
    expect(toFieldErrorProps(undefined)).toEqual({ error: false, errorMessage: '' });
    expect(toFieldErrorProps('Required')).toEqual({ error: true, errorMessage: 'Required' });
  });
});
