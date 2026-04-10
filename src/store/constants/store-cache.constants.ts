/** Prefix for all store list cache keys */
export const STORE_CACHE_PREFIX = 'store' as const;

/** Redis key that stores the current cache version for busting all list queries */
export const STORE_CACHE_VERSION_KEY = 'store:_version' as const;

/** TTL for paginated store list results. cache-manager v5 uses milliseconds. */
export const STORE_LIST_CACHE_TTL_MS = 300_000; // 5 min

/** TTL for the store list version key. cache-manager v5 uses milliseconds. */
export const STORE_VERSION_CACHE_TTL_MS = 86_400_000; // 24 h
