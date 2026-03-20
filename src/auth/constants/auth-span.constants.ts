/**
 * Auth 2FA domain OpenTelemetry semantic convention constants.
 * Aligned with OpenTelemetry naming: ATTR_ for attributes, SPAN_ for span names.
 * @see https://opentelemetry.io/docs/specs/semconv/
 */

/** Span/operation names for 2FA tracing */
export const SPAN_2FA_GENERATE_SECRET = 'auth.2fa.generateSecret' as const;
export const SPAN_2FA_VERIFY_ACTIVATE = 'auth.2fa.verifyAndActivate' as const;
export const SPAN_2FA_VERIFY = 'auth.2fa.verify' as const;
export const SPAN_2FA_DISABLE = 'auth.2fa.disable' as const;
export const SPAN_2FA_GET_STATUS = 'auth.2fa.getStatus' as const;
export const SPAN_2FA_VERIFY_BACKUP_CODE = 'auth.2fa.verifyBackupCode' as const;

/** Attribute keys for 2FA span attributes */
export const ATTR_2FA_USER_ID = 'auth.2fa.user_id' as const;
export const ATTR_2FA_ENABLED = 'auth.2fa.enabled' as const;
export const ATTR_2FA_BACKUP_CODES_REMAINING = 'auth.2fa.backup_codes_remaining' as const;

/**
 * Grouped span names for concise imports in services.
 */
export const AUTH_2FA_SPAN_NAMES = {
  GENERATE_SECRET: SPAN_2FA_GENERATE_SECRET,
  VERIFY_ACTIVATE: SPAN_2FA_VERIFY_ACTIVATE,
  VERIFY: SPAN_2FA_VERIFY,
  DISABLE: SPAN_2FA_DISABLE,
  GET_STATUS: SPAN_2FA_GET_STATUS,
  VERIFY_BACKUP_CODE: SPAN_2FA_VERIFY_BACKUP_CODE,
} as const;

/**
 * Grouped attribute keys for concise imports in services.
 */
export const AUTH_2FA_SPAN_ATTRIBUTES = {
  USER_ID: ATTR_2FA_USER_ID,
  ENABLED: ATTR_2FA_ENABLED,
  BACKUP_CODES_REMAINING: ATTR_2FA_BACKUP_CODES_REMAINING,
} as const;
