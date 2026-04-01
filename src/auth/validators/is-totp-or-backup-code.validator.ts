import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

/**
 * ReDoS-safe validator for TOTP (6 digits) or backup code (XXXX-XXXX-XXXX).
 * Uses O(n) character iteration instead of backtracking-prone regex.
 */
function isTotpOrBackupCode(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const s = value;
  if (s.length === 6) {
    return s.split('').every(c => c >= '0' && c <= '9');
  }
  if (s.length === 14 && s[4] === '-' && s[9] === '-') {
    const part = (start: number, len: number) => {
      for (let i = start; i < start + len; i++) {
        const c = s.charCodeAt(i);
        if (!((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122))) return false;
      }
      return true;
    };
    return part(0, 4) && part(5, 4) && part(10, 4);
  }
  return false;
}

export function IsTotpOrBackupCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTotpOrBackupCode',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {
        message: 'Code must be 6-digit TOTP or backup code format XXXX-XXXX-XXXX',
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return isTotpOrBackupCode(value);
        },
      },
    });
  };
}
