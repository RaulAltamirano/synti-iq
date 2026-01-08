import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenFactory } from 'src/auth/factory/token-factory';
import { UserSessionService } from 'src/user-session/user-session.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { CreateUserSessionDto } from 'src/user-session/dto/create-user-session.dto';
import { TokensUserDto } from 'src/auth/dto';
import { SessionMetadata } from '../interfaces/session-metadata.interface';

@Injectable()
export class AuthSessionManager {
  private readonly logger = new Logger(AuthSessionManager.name);

  constructor(
    private readonly tokenFactory: TokenFactory,
    private readonly sessionService: UserSessionService,
    private readonly redisService: RedisService,
    private readonly anomalyDetectionService: AnomalyDetectionService,
  ) {}

  async createSession(userId: string, metadata: SessionMetadata): Promise<TokensUserDto> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const sessionId = this.tokenFactory.generateId();
      const { tokens, refreshTokenHash } = await this.tokenFactory.generateTokens(
        userId,
        sessionId,
      );

      const lastUsed = metadata.lastUsed || new Date();
      const createSessionDto: CreateUserSessionDto = {
        userId,
        refreshToken: refreshTokenHash,
        sessionId,
        deviceInfo: metadata.deviceInfo,
        userAgent: metadata.deviceInfo?.userAgent,
        ipAddress: metadata.deviceInfo?.ipAddress,
        lastUsed,
      };

      await this.sessionService.createSession(createSessionDto);

      await this.sessionService.setSessionInRedisUnified(userId, sessionId, {
        refreshTokenHash,
        isValid: true,
        lastUsed: lastUsed.toISOString(),
        deviceInfo: metadata.deviceInfo,
      });

      return tokens;
    } catch (error) {
      this.logger.error(
        `Error creating user session for user ${userId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user authentication session');
    }
  }

  async refreshSession(
    userId: string,
    sessionId: string,
    refreshToken: string,
    metadata: SessionMetadata,
  ): Promise<TokensUserDto> {
    await this.checkAnomalies(userId, sessionId, metadata);

    await this.tokenFactory.invalidateRefreshToken(userId, sessionId, refreshToken);
    const { tokens, refreshTokenHash } = await this.tokenFactory.generateTokens(userId, sessionId);

    await this.updateSessionInRedis(userId, sessionId, refreshTokenHash);

    await this.anomalyDetectionService.recordTokenUsage(userId, sessionId, {
      ipAddress: metadata.deviceInfo?.ipAddress,
      userAgent: metadata.deviceInfo?.userAgent,
      deviceInfo: metadata.deviceInfo,
    });

    return tokens;
  }

  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    await this.sessionService.invalidateSession(userId, sessionId);
    await this.tokenFactory.deleteRefreshToken(userId, sessionId);
  }

  async invalidateAllSessions(userId: string): Promise<void> {
    await this.sessionService.invalidateAllSessions(userId);
  }

  async verifyRefreshToken(refreshToken: string): Promise<{ userId: string; sessionId: string }> {
    return this.tokenFactory.verifyRefreshToken(refreshToken);
  }

  extractSessionIdFromToken(accessToken: string, userId: string): string | null {
    try {
      const decoded = this.tokenFactory.verifyAccessToken(accessToken);
      if (decoded.sub !== userId) {
        return null;
      }
      return decoded.sid;
    } catch (error) {
      const unverified = this.tokenFactory.decodeToken(accessToken);
      return unverified?.sub === userId ? unverified.sid : null;
    }
  }

  private async checkAnomalies(
    userId: string,
    sessionId: string,
    metadata: SessionMetadata,
  ): Promise<void> {
    const anomaly = await this.anomalyDetectionService.detectTokenReuse(userId, sessionId, {
      ipAddress: metadata.deviceInfo?.ipAddress,
      userAgent: metadata.deviceInfo?.userAgent,
      deviceInfo: metadata.deviceInfo,
    });

    if (anomaly.isAnomaly && anomaly.severity === 'high') {
      this.logger.warn(`Anomaly detected during token refresh: ${anomaly.reason}`, {
        userId,
        sessionId,
        severity: anomaly.severity,
      });
      throw new BadRequestException('Security anomaly detected. Please login again.');
    }
  }

  private async updateSessionInRedis(
    userId: string,
    sessionId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    const sessionKey = `session:${userId}:${sessionId}`;
    const currentSession = await this.redisService.get<{
      refreshTokenHash: string;
      isValid: boolean;
      lastUsed?: string;
      deviceInfo?: SessionMetadata['deviceInfo'];
      usedTokens?: string[];
    }>(sessionKey);

    if (currentSession) {
      await this.sessionService.setSessionInRedisUnified(userId, sessionId, {
        refreshTokenHash,
        isValid: currentSession.isValid,
        lastUsed: new Date().toISOString(),
        deviceInfo: currentSession.deviceInfo,
        usedTokens: currentSession.usedTokens,
      });
    } else {
      const activeSessions = await this.sessionService.findActiveByUserId(userId);
      const dbSession = activeSessions.find(s => s.sessionId === sessionId);

      await this.sessionService.setSessionInRedisUnified(userId, sessionId, {
        refreshTokenHash,
        isValid: dbSession?.isValid ?? true,
        lastUsed: new Date().toISOString(),
        deviceInfo: dbSession?.deviceInfo ?? null,
      });
    }
  }
}
