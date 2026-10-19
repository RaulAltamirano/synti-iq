import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

function isAsciiUpper(c: number): boolean {
  return c >= 65 && c <= 90;
}

function isAsciiLower(c: number): boolean {
  return c >= 97 && c <= 122;
}

function isDigitOrPrintableSpecial(c: number): boolean {
  return (c >= 48 && c <= 57) || (c >= 33 && c <= 126);
}

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
  for (const segment of value) {
    const c = segment.codePointAt(0);
    if (isAsciiUpper(c)) hasUpper = true;
    else if (isAsciiLower(c)) hasLower = true;
    else if (isDigitOrPrintableSpecial(c)) hasDigitOrSpecial = true;
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
