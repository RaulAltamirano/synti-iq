/** Session key prefix used to build Redis cache keys for user sessions. */
export const SESSION_PREFIX = 'session' as const;

/** Session TTL in seconds: 7 days. Used by RedisService (EX flag). */
export const SESSION_TTL_S = 7 * 24 * 60 * 60;

/** Default number of days after which inactive sessions are purged from DB. */
export const SESSION_EXPIRATION_DAYS_DEFAULT = 30;

/** Maximum number of token refreshes per session before anomaly is flagged. */
export const SESSION_MAX_REFRESH_COUNT = 100;

/**
 * Builds the Redis key for a session payload.
 * Pattern: `session:{userId}:{sessionId}`
 */
export function buildSessionKey(userId: string, sessionId: string): string {
  return `${SESSION_PREFIX}:${userId}:${sessionId}`;
}
