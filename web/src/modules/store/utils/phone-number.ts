import {
  DEFAULT_PHONE_DIAL,
  PHONE_COUNTRY_OPTIONS,
  findPhoneCountryByDial,
  type PhoneCountryOption,
} from '@/modules/store/constants/phone-country-codes';

export interface ParsedPhone {
  dial: string;
  local: string;
}

const DIAL_CODES_LONGEST_FIRST = [...PHONE_COUNTRY_OPTIONS].sort(
  (a, b) => b.dial.length - a.dial.length
);

/** Strip to digits and cap length for the local (national) part. */
export function sanitizeLocalDigits(raw: string, maxLength: number): string {
  return raw.replace(/\D/g, '').slice(0, maxLength);
}

export function parseE164Phone(full: string): ParsedPhone {
  const trimmed = full.trim();
  if (!trimmed) {
    return { dial: DEFAULT_PHONE_DIAL, local: '' };
  }

  if (trimmed.startsWith('+')) {
    const match = DIAL_CODES_LONGEST_FIRST.find((c) => trimmed.startsWith(c.dial));
    if (match) {
      return {
        dial: match.dial,
        local: sanitizeLocalDigits(trimmed.slice(match.dial.length), match.localLength),
      };
    }
    return { dial: DEFAULT_PHONE_DIAL, local: '' };
  }

  const country = findPhoneCountryByDial(DEFAULT_PHONE_DIAL);
  return {
    dial: DEFAULT_PHONE_DIAL,
    local: sanitizeLocalDigits(trimmed, country?.localLength ?? 10),
  };
}

export function buildE164Phone(dial: string, local: string, country?: PhoneCountryOption): string {
  const c = country ?? findPhoneCountryByDial(dial);
  const maxLen = c?.localLength ?? 10;
  const digits = sanitizeLocalDigits(local, maxLen);
  if (!digits) return '';
  return `${dial}${digits}`;
}

export function validateE164Phone(full: string): string | null {
  const trimmed = full.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith('+')) {
    return 'Include the country code';
  }

  const parsed = parseE164Phone(trimmed);
  const country = findPhoneCountryByDial(parsed.dial);
  if (!country) {
    return 'Select a supported country code';
  }

  const built = buildE164Phone(parsed.dial, parsed.local, country);
  if (built !== trimmed.replace(/\s/g, '')) {
    return 'Enter only digits in the phone number';
  }

  if (parsed.local.length < country.localLength) {
    return `Enter ${country.localLength} digits for ${country.label}`;
  }

  if (parsed.local.length > country.localLength) {
    return `Use at most ${country.localLength} digits for ${country.label}`;
  }

  return null;
}
