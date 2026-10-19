import { Injectable } from '@nestjs/common';
import { UserSessionService } from 'src/user-session/user-session.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import {
  AUTH_USER_SESSIONS_SPAN_NAMES,
  AUTH_CORE_SPAN_ATTRIBUTES,
} from 'src/auth/constants/auth-span.constants';
import { FilterUserSessionDto } from 'src/user-session/dto/filter-user-session.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { UserSessionResponseDto } from 'src/user-session/dto/user-session-response.dto';

/**
 * SessionService is a facade over UserSessionService that adds observability
 * spans to session operations. This ensures all session operations from AuthService
 * and other auth-related services are traced and monitored.
 *
 * This service is registered as AuthSessionCommandService in AuthModule.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly userSessionService: UserSessionService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async validateSessionOwnership(userId: string, sessionId: string): Promise<boolean> {
    return this.observabilityService.withSpan(
      AUTH_USER_SESSIONS_SPAN_NAMES.VALIDATE_OWNERSHIP,
      async span => {
        span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, userId);
        return this.userSessionService.validateSessionOwnership(userId, sessionId);
      },
    );
  }

  async invalidateOne(userId: string, sessionId: string): Promise<void> {
    return this.observabilityService.withSpan(
      AUTH_USER_SESSIONS_SPAN_NAMES.INVALIDATE_ONE,
      async span => {
        span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, userId);
        return this.userSessionService.invalidateSession(userId, sessionId);
      },
    );
  }

  async invalidateAll(userId: string): Promise<void> {
    return this.observabilityService.withSpan(
      AUTH_USER_SESSIONS_SPAN_NAMES.INVALIDATE_ALL,
      async span => {
        span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, userId);
        return this.userSessionService.invalidateAllSessions(userId);
      },
    );
  }

  async invalidateSessionsByDeviceInfo(
    userId: string,
    deviceInfo: Partial<{ userAgent: string; ipAddress: string; deviceType: string }>,
  ): Promise<number> {
    return this.observabilityService.withSpan(
      AUTH_USER_SESSIONS_SPAN_NAMES.INVALIDATE_BY_DEVICE,
      async span => {
        span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, userId);
        return this.userSessionService.invalidateSessionsByDeviceInfo(userId, deviceInfo);
      },
    );
  }

  async updateSessionLastUsed(userId: string, sessionId: string): Promise<void> {
    return this.observabilityService.withSpan(
      AUTH_USER_SESSIONS_SPAN_NAMES.MARK_USED,
      async span => {
        span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, userId);
        return this.userSessionService.updateSessionLastUsed(userId, sessionId);
      },
    );
  }

  async listActive(
    userId: string,
    filters: FilterUserSessionDto,
  ): Promise<PaginatedResponse<UserSessionResponseDto>> {
    return this.observabilityService.withSpan(
      AUTH_USER_SESSIONS_SPAN_NAMES.LIST_ACTIVE,
      async span => {
        span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, userId);
        return this.userSessionService.getActiveSessions(userId, filters);
      },
    );
  }
}
