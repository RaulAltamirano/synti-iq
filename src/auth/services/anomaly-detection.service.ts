import { Injectable, Logger } from '@nestjs/common';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { RedisService } from 'src/shared/redis/redis.service';
import {
  SESSION_TTL_S,
  SESSION_MAX_REFRESH_COUNT,
  buildSessionKey,
  buildRefreshCountKey,
} from 'src/user-session/constants/user-session-cache.constants';
import { AUTH_ANOMALY_SPAN_NAMES } from 'src/auth/constants/auth-span.constants';
import type {
  AnomalySessionRedisPayload,
  TokenUsageMetadata,
  AnomalyDetectionResult,
} from 'src/auth/interfaces/token-usage-metadata.interface';

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async detectTokenReuse(
    userId: string,
    sessionId: string,
    metadata: TokenUsageMetadata,
  ): Promise<AnomalyDetectionResult> {
    return this.observabilityService.withSpan(AUTH_ANOMALY_SPAN_NAMES.DETECT_REUSE, async () => {
      const sessionKey = buildSessionKey(userId, sessionId);
      const sessionData = await this.redisService.get<AnomalySessionRedisPayload>(sessionKey);

      if (!sessionData) {
        return { isAnomaly: false };
      }

      const anomalies: string[] = [];

      if (
        sessionData.deviceInfo?.ipAddress &&
        metadata.ipAddress &&
        sessionData.deviceInfo.ipAddress !== metadata.ipAddress
      ) {
        this.logger.warn(
          `IP change detected for user ${userId}: ${sessionData.deviceInfo.ipAddress} -> ${metadata.ipAddress}`,
        );
        anomalies.push('IP address changed');
      }

      if (
        sessionData.deviceInfo?.userAgent &&
        metadata.userAgent &&
        sessionData.deviceInfo.userAgent !== metadata.userAgent
      ) {
        this.logger.warn(`User agent change detected for user ${userId}`);
        anomalies.push('User agent changed');
      }

      const refreshCountKey = buildRefreshCountKey(userId, sessionId);
      const rawCount = await this.redisService.getClient().get(refreshCountKey);
      const refreshCount = rawCount !== null ? parseInt(rawCount, 10) : 0;
      if (refreshCount > SESSION_MAX_REFRESH_COUNT) {
        anomalies.push('Excessive token refreshes');
      }

      if (anomalies.length > 0) {
        return {
          isAnomaly: true,
          reason: anomalies.join(', '),
          severity: anomalies.length > 1 ? 'high' : 'medium',
        };
      }

      return { isAnomaly: false };
    });
  }

  async recordTokenUsage(
    userId: string,
    sessionId: string,
    metadata: TokenUsageMetadata,
  ): Promise<void> {
    return this.observabilityService.withSpan(AUTH_ANOMALY_SPAN_NAMES.RECORD_USAGE, async () => {
      const sessionKey = buildSessionKey(userId, sessionId);
      const sessionData =
        (await this.redisService.get<AnomalySessionRedisPayload>(sessionKey)) ?? {};

      await this.redisService.set(
        sessionKey,
        {
          ...sessionData,
          deviceInfo: {
            ...sessionData.deviceInfo,
            ...metadata,
          },
          lastRefresh: new Date().toISOString(),
        },
        SESSION_TTL_S,
      );

      const refreshCountKey = buildRefreshCountKey(userId, sessionId);
      const newCount = await this.redisService.incr(refreshCountKey);
      if (newCount === 1) {
        await this.redisService.expire(refreshCountKey, SESSION_TTL_S);
      }
    });
  }
}
