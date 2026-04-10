import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

/**
 * ReDoS-safe validator for permission names: lowercase letters, digits, underscores.
 * Uses O(n) character iteration instead of regex.
 */
function isPermissionName(value: unknown): boolean {
  if (typeof value !== 'string' || value.length === 0) return false;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    const ok = (c >= 97 && c <= 122) || (c >= 48 && c <= 57) || c === 95;
    if (!ok) return false;
  }
  return true;
}

export function IsPermissionName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPermissionName',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {
        message: 'Permission name must contain only lowercase letters, numbers, and underscores',
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return isPermissionName(value);
        },
      },
    });
  };
}
