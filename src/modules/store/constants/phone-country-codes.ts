/**
 * Curated dial codes for the store wizard — no libphonenumber dependency.
 * `localLength` is the expected national number length (mobile where applicable).
 */
export interface PhoneCountryOption {
  code: string;
  dial: string;
  label: string;
  localLength: number;
}

export const DEFAULT_PHONE_DIAL = '+52';

export const PHONE_COUNTRY_OPTIONS: readonly PhoneCountryOption[] = [
  { code: 'MX', dial: '+52', label: 'Mexico', localLength: 10 },
  { code: 'US', dial: '+1', label: 'United States / Canada', localLength: 10 },
  { code: 'CO', dial: '+57', label: 'Colombia', localLength: 10 },
  { code: 'AR', dial: '+54', label: 'Argentina', localLength: 10 },
  { code: 'CL', dial: '+56', label: 'Chile', localLength: 9 },
  { code: 'PE', dial: '+51', label: 'Peru', localLength: 9 },
  { code: 'EC', dial: '+593', label: 'Ecuador', localLength: 9 },
  { code: 'GT', dial: '+502', label: 'Guatemala', localLength: 8 },
  { code: 'SV', dial: '+503', label: 'El Salvador', localLength: 8 },
  { code: 'CR', dial: '+506', label: 'Costa Rica', localLength: 8 },
  { code: 'PA', dial: '+507', label: 'Panama', localLength: 8 },
  { code: 'BR', dial: '+55', label: 'Brazil', localLength: 11 },
] as const;

export function findPhoneCountryByDial(dial: string): PhoneCountryOption | undefined {
  return PHONE_COUNTRY_OPTIONS.find((c) => c.dial === dial);
}
