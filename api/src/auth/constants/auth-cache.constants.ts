/** Redis TTL (seconds) for temporary 2FA setup secret */
export const TWO_FA_SETUP_REDIS_TTL_SECONDS = 300;

/** Redis key prefix for 2FA setup flow */
export const TWO_FA_SETUP_REDIS_KEY_PREFIX = '2fa:setup:' as const;

export function twoFaSetupRedisKey(userId: string): string {
  return `${TWO_FA_SETUP_REDIS_KEY_PREFIX}${userId}`;
}
