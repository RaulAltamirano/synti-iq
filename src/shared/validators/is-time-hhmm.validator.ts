import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

/**
 * ReDoS-safe HH:MM time validator (00:00 to 23:59).
 * Uses O(1) string checks instead of backtracking-prone regex.
 */
function isTimeHhmm(value: unknown): boolean {
  if (typeof value !== 'string' || value.length !== 5) return false;
  if (value[2] !== ':') return false;
  const h0 = value.charCodeAt(0) - 48;
  const h1 = value.charCodeAt(1) - 48;
  const m0 = value.charCodeAt(3) - 48;
  const m1 = value.charCodeAt(4) - 48;
  if (h0 < 0 || h0 > 9 || h1 < 0 || h1 > 9 || m0 < 0 || m0 > 9 || m1 < 0 || m1 > 9) return false;
  if (h0 > 2) return false;
  const hours = h0 * 10 + h1;
  if (hours > 23) return false;
  if (m0 > 5) return false;
  const minutes = m0 * 10 + m1;
  return minutes <= 59;
}

export function IsTimeHhmm(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTimeHhmm',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? { message: 'El formato de hora debe ser HH:MM' },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return isTimeHhmm(value);
        },
      },
    });
  };
}
