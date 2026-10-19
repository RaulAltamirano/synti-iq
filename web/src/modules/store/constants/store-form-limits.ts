/**
 * Client-side limits for the store creation wizard.
 * Keeps payloads bounded and aligned with typical API / DB columns.
 */
export const STORE_FORM_LIMITS = {
  STORE_NAME_MIN: 2,
  STORE_NAME_MAX: 255,
  /** RFC 5321 path length upper bound */
  EMAIL_MAX_LENGTH: 254,
  /** Max E.164 length stored in the wizard (+ dial + national number) */
  PHONE_MAX_CHARS: 16,
  /** Default national number length (Mexico mobile) */
  PHONE_LOCAL_DIGITS_DEFAULT: 10,
  /** API `CreateLocationDto.name`: 2–100 characters */
  LOCATION_NAME_MAX: 100,
  /** API `CreateLocationDto.fullAddress`: 5–255 characters */
  LOCATION_FULL_ADDRESS_MAX: 255,
  /** API neighborhood / city / state / country: max 100 (street allows 255; 100 keeps one shared limit) */
  LOCATION_LINE_MAX: 100,
  /** API `CreateLocationDto.addressReference`: max 255 */
  LOCATION_REFERENCE_MAX: 255,
  /** API `CreateLocationDto.postalCode`: max 20 */
  POSTAL_CODE_MAX: 20,
  /** Sane cap for currency-free targets (avoids scientific notation in inputs) */
  SALES_MAX: 9_999_999_999,
} as const;
