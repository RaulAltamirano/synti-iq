import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

/**
 * ReDoS-safe password complexity validator.
 * Replaces vulnerable regex with O(n) character iteration.
 * Requires: uppercase, lowercase, and at least one digit or special character.
 */
function isPasswordComplex(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  let hasUpper = false;
  let hasLower = false;
  let hasDigitOrSpecial = false;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c >= 65 && c <= 90) hasUpper = true;
    else if (c >= 97 && c <= 122) hasLower = true;
    else if (c >= 48 && c <= 57) hasDigitOrSpecial = true;
    else if (c >= 33 && c <= 126) hasDigitOrSpecial = true; // printable non-alpha
  }
  return hasUpper && hasLower && hasDigitOrSpecial;
}

export function IsPasswordComplex(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordComplex',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {
        message:
          'The password must have an uppercase letter, lowercase letter, and a number or special character',
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return isPasswordComplex(value);
        },
      },
    });
  };
}
