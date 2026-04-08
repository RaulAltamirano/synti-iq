import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/shared/redis/redis.service';
import {
  SESSION_TTL_S,
  SESSION_MAX_REFRESH_COUNT,
  buildSessionKey,
} from 'src/user-session/constants/user-session-cache.constants';

interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    deviceType?: string;
    browser?: string;
    os?: string;
  };
}

interface AnomalyResult {
  isAnomaly: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  constructor(private readonly redisService: RedisService) {}

  async detectTokenReuse(
    userId: string,
    sessionId: string,
    metadata: SessionMetadata,
  ): Promise<AnomalyResult> {
    const sessionKey = buildSessionKey(userId, sessionId);
    const sessionData = await this.redisService.get<{
      deviceInfo?: SessionMetadata;
      lastRefresh?: string;
      refreshCount?: number;
    }>(sessionKey);

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

    const refreshCount = (sessionData.refreshCount || 0) + 1;
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
  }

  async recordTokenUsage(
    userId: string,
    sessionId: string,
    metadata: SessionMetadata,
  ): Promise<void> {
    const sessionKey = buildSessionKey(userId, sessionId);
    const sessionData =
      (await this.redisService.get<{
        deviceInfo?: SessionMetadata;
        refreshCount?: number;
        [key: string]: any;
      }>(sessionKey)) || {};

    await this.redisService.set(
      sessionKey,
      {
        ...sessionData,
        deviceInfo: {
          ...sessionData.deviceInfo,
          ...metadata,
        },
        lastRefresh: new Date().toISOString(),
        refreshCount: (sessionData.refreshCount || 0) + 1,
      },
      SESSION_TTL_S,
    );
  }
}
