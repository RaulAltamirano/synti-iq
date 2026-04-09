/** Metadata about the token usage context captured at refresh time. */
export interface TokenUsageMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, unknown>;
}

/** Redis session payload fields read/written by AnomalyDetectionService */
export interface AnomalySessionRedisPayload {
  deviceInfo?: TokenUsageMetadata;
  lastRefresh?: string;
  // refreshCount removed — stored atomically in a separate Redis key via INCR
  refreshTokenHash?: string;
  isValid?: boolean;
  lastUsed?: string;
  usedTokens?: string[];
}
