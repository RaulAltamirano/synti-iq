import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

/**
 * ReDoS-safe HH:MM time validator (00:00 to 23:59).
 * Uses O(1) string checks instead of backtracking-prone regex.
 */
const HHMM_DIGIT_INDEXES = [0, 1, 3, 4] as const;

function isTimeHhmmShape(value: string): boolean {
  return value.length === 5 && value[2] === ':';
}

function digitsAreAscii0To9(value: string): boolean {
  for (const i of HHMM_DIGIT_INDEXES) {
    const d = (value.codePointAt(i) ?? 0) - 48;
    if (d < 0 || d > 9) {
      return false;
    }
  }
  return true;
}

function isHourMinuteInRange(value: string): boolean {
  const h0 = (value.codePointAt(0) ?? 0) - 48;
  const h1 = (value.codePointAt(1) ?? 0) - 48;
  const m0 = (value.codePointAt(3) ?? 0) - 48;
  const m1 = (value.codePointAt(4) ?? 0) - 48;
  if (h0 > 2) return false;
  const hours = h0 * 10 + h1;
  if (hours > 23) return false;
  if (m0 > 5) return false;
  const minutes = m0 * 10 + m1;
  return minutes <= 59;
}

function isTimeHhmm(value: unknown): boolean {
  if (typeof value !== 'string' || !isTimeHhmmShape(value)) return false;
  if (!digitsAreAscii0To9(value)) return false;
  return isHourMinuteInRange(value);
}

export function IsTimeHhmm(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTimeHhmm',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? { message: 'Time must be in HH:MM format' },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return isTimeHhmm(value);
        },
      },
    });
  };
}
