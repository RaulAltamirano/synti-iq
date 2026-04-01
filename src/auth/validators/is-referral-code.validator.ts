import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

/**
 * ReDoS-safe validator for referral codes: 6-12 alphanumeric (A-Z, 0-9).
 * Uses O(n) character iteration instead of regex.
 */
function isReferralCode(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.length < 6 || value.length > 12) return false;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    const isAlphaNum = (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
    if (!isAlphaNum) return false;
  }
  return true;
}

export function IsReferralCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isReferralCode',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {
        message: 'Referral code must be 6-12 alphanumeric characters',
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return isReferralCode(value);
        },
      },
    });
  };
}
