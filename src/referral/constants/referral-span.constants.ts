/**
 * Referral domain OpenTelemetry semantic convention constants.
 * Aligned with OpenTelemetry naming: ATTR_ for attributes, SPAN_ for span names.
 * @see https://opentelemetry.io/docs/specs/semconv/
 */

/** Span/operation names for referral tracing */
export const SPAN_REFERRAL_VALIDATE_CODE = 'referral.validateCode' as const;
export const SPAN_REFERRAL_RECORD_USAGE = 'referral.recordUsage' as const;
export const SPAN_REFERRAL_GET_MY_CODE = 'referral.getMyCode' as const;
export const SPAN_REFERRAL_GET_MY_REFERRER = 'referral.getMyReferrer' as const;
export const SPAN_REFERRAL_GET_MY_REFERRALS_STATS = 'referral.getMyReferralsStats' as const;
export const SPAN_REFERRAL_GET_MY_REFERRALS = 'referral.getMyReferrals' as const;
export const SPAN_REFERRAL_FIND_BY_BUSINESS_PROFILE = 'referral.findByBusinessProfileId' as const;
export const SPAN_REFERRAL_CREATE_CODE = 'referral.createCode' as const;
export const SPAN_REFERRAL_ENSURE_CODE = 'referral.ensureCodeForBusinessProfile' as const;

/** Attribute keys for referral span attributes */
export const ATTR_REFERRAL_OPERATION = 'referral.operation' as const;
export const ATTR_REFERRAL_CODE_LENGTH = 'referral.code_length' as const;
export const ATTR_REFERRAL_IS_VALID = 'referral.is_valid' as const;
export const ATTR_REFERRAL_REFERRAL_CODE_ID = 'referral.referral_code_id' as const;
export const ATTR_REFERRAL_BUSINESS_PROFILE_ID = 'referral.business_profile_id' as const;
export const ATTR_REFERRAL_REFERRED_USER_ID = 'referral.referred_user_id' as const;
export const ATTR_REFERRAL_PAGE = 'referral.page' as const;
export const ATTR_REFERRAL_LIMIT = 'referral.limit' as const;
export const ATTR_REFERRAL_TOTAL_ITEMS = 'referral.total_items' as const;
export const ATTR_REFERRAL_USER_ID = 'referral.user_id' as const;
export const ATTR_REFERRAL_USER_ROLE = 'referral.user_role' as const;

/** Union type of all attribute keys for strict typing */
export type ReferralSpanAttributeKey =
  | typeof ATTR_REFERRAL_OPERATION
  | typeof ATTR_REFERRAL_CODE_LENGTH
  | typeof ATTR_REFERRAL_IS_VALID
  | typeof ATTR_REFERRAL_REFERRAL_CODE_ID
  | typeof ATTR_REFERRAL_BUSINESS_PROFILE_ID
  | typeof ATTR_REFERRAL_REFERRED_USER_ID
  | typeof ATTR_REFERRAL_PAGE
  | typeof ATTR_REFERRAL_LIMIT
  | typeof ATTR_REFERRAL_TOTAL_ITEMS
  | typeof ATTR_REFERRAL_USER_ID
  | typeof ATTR_REFERRAL_USER_ROLE;

/**
 * Grouped span names for concise imports in services.
 * Usage: import { REFERRAL_SPAN_NAMES } from './constants'
 */
export const REFERRAL_SPAN_NAMES = {
  VALIDATE_CODE: SPAN_REFERRAL_VALIDATE_CODE,
  RECORD_USAGE: SPAN_REFERRAL_RECORD_USAGE,
  CREATE_CODE: SPAN_REFERRAL_CREATE_CODE,
  GET_MY_CODE: SPAN_REFERRAL_GET_MY_CODE,
  GET_MY_REFERRER: SPAN_REFERRAL_GET_MY_REFERRER,
  GET_MY_REFERRALS_STATS: SPAN_REFERRAL_GET_MY_REFERRALS_STATS,
  GET_MY_REFERRALS: SPAN_REFERRAL_GET_MY_REFERRALS,
} as const;

/**
 * Grouped attribute keys for concise imports in services.
 * Usage: import { REFERRAL_SPAN_ATTRIBUTES } from './constants'
 */
export const REFERRAL_SPAN_ATTRIBUTES = {
  CODE_LENGTH: ATTR_REFERRAL_CODE_LENGTH,
  IS_VALID: ATTR_REFERRAL_IS_VALID,
  REFERRAL_CODE_ID: ATTR_REFERRAL_REFERRAL_CODE_ID,
  BUSINESS_PROFILE_ID: ATTR_REFERRAL_BUSINESS_PROFILE_ID,
  REFERRED_USER_ID: ATTR_REFERRAL_REFERRED_USER_ID,
  USER_ID: ATTR_REFERRAL_USER_ID,
  PAGE: ATTR_REFERRAL_PAGE,
  LIMIT: ATTR_REFERRAL_LIMIT,
  TOTAL_ITEMS: ATTR_REFERRAL_TOTAL_ITEMS,
} as const;
