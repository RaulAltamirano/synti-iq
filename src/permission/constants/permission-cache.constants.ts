/** Cache key prefix; full key is `${USER_PERMISSIONS_CACHE_PREFIX}${userId}`. */
export const USER_PERMISSIONS_CACHE_PREFIX = 'user:permissions:';

/** TTL in milliseconds (5 minutes), aligned with guard caching. */
export const USER_PERMISSIONS_CACHE_TTL_MS = 300_000;
