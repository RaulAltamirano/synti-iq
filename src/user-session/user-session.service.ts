import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UserSessionResponseDto } from './dto/user-session-response.dto';
import { SessionCacheService } from './user-session-cache.service';
import { UserSessionRepository } from './user-session.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { FilterUserSessionDto } from './dto/filter-user-session.dto';

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);
  private readonly CACHE_PREFIX = 'user_sessions';

  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionCacheService: SessionCacheService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Verifica si el usuario es dueño de la sesión
   */
  async validateSessionOwnership(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    this.validateParams(userId, sessionId);

    try {
      this.logger.debug(`Validating session ownership for user ${userId} and session ${sessionId}`);
      
      // First check the database directly
      const session = await this.userSessionRepository.findByUserAndSessionId({
        userId,
        sessionId,
      });
      
      const isValid = !!session;
      this.logger.debug(`Database check result for session ${sessionId}: ${isValid}`);

      // Update cache with the database result
      await this.sessionCacheService.setSessionValidity(
        userId,
        sessionId,
        isValid,
      );

      return isValid;
    } catch (error) {
      this.logger.error(`Error validating session ownership: ${error.message}`, error.stack);
      return this.handleError(error, 'validating session ownership');
    }
  }

  /**
   * Invalida una sesión
   */
  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    this.validateParams(userId, sessionId);

    try {
      const affected = await this.userSessionRepository.update(
        userId,
        sessionId,
        { isValid: false },
      );
      if (affected === 0) throw new NotFoundException('Session not found');

      await this.sessionCacheService.setSessionValidity(
        userId,
        sessionId,
        false,
      );
    } catch (error) {
      this.handleError(error, 'invalidating session');
    }
  }

  /**
   * Crea una sesión
   */
  async createSession(
    dto: CreateUserSessionDto,
  ): Promise<UserSessionResponseDto> {
    this.ensureUserId(dto.userId);

    try {
      // Limpiamos cualquier caché existente para este usuario
      await this.sessionCacheService.deleteSession(dto.userId, dto.sessionId);

      const saved = await this.userSessionRepository.create({
        ...dto,
      });

      // Cacheamos la nueva sesión como válida
      await this.sessionCacheService.setSessionValidity(
        dto.userId,
        saved.sessionId,
        true,
      );

      this.logger.debug(`Created and cached new session ${saved.sessionId} for user ${dto.userId}`);
      return this.mapToResponseDto(saved);
    } catch (error) {
      this.handleError(error, 'creating user session');
    }
  }

  /**
   * Invalida todas las sesiones de un usuario
   */
  async invalidateAllSessions(userId: string): Promise<void> {
    this.ensureUserId(userId);

    try {
      const sessions =
        await this.userSessionRepository.findActiveByUserId(userId);
      await this.userSessionRepository.invalidateAllForUser(userId);

      await Promise.all(
        sessions.map((session) =>
          this.sessionCacheService.setSessionValidity(
            userId,
            session.sessionId,
            false,
          ),
        ),
      );
    } catch (error) {
      this.handleError(error, 'invalidating all sessions');
    }
  }

  /**
   * Obtiene sesiones activas con paginación
   */
  async getActiveSessions(
    userId: string,
    filters: FilterUserSessionDto,
  ): Promise<PaginatedResponse<UserSessionResponseDto>> {
    this.ensureUserId(userId);

    try {
      const cacheKey = PaginationCacheUtil.buildCacheKey(
        `${this.CACHE_PREFIX}_${userId}`,
        filters,
      );
      const cachedResult = await this.cacheManager.get<PaginatedResponse<UserSessionResponseDto>>(
        cacheKey,
      );

      if (cachedResult) {
        return cachedResult;
      }

      const [sessions, total] = await this.userSessionRepository.getActiveSessions(
        userId,
        filters,
      );

      if (!sessions || sessions.length === 0) {
        this.logger.debug(`No active sessions found for user ${userId}`);
        return PaginationCacheUtil.createPaginatedResponse({
          data: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        });
      }

      const mappedSessions = sessions.map((session) => this.mapToResponseDto(session));
      const response = PaginationCacheUtil.createPaginatedResponse({
        data: mappedSessions,
        total,
        page: filters.page,
        limit: filters.limit,
      });

      await this.cacheManager.set(cacheKey, response, 300); // Cache for 5 minutes
      return response;
    } catch (error) {
      this.logger.error(`Error getting active sessions: ${error.message}`, error.stack);
      return this.handleError(error, 'getting active sessions');
    }
  }

  /**
   * Limpia sesiones expiradas
   */
  async cleanupExpiredSessions(expirationDays = 30): Promise<void> {
    try {
      const expiration = new Date(
        Date.now() - expirationDays * 24 * 60 * 60 * 1000,
      );
      const deleted =
        await this.userSessionRepository.deleteOlderThan(expiration);
      this.logger.log(`Cleaned up ${deleted} expired sessions`);
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Actualiza la última fecha de uso de una sesión
   */
  async updateSessionLastUsed(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    this.validateParams(userId, sessionId);

    try {
      const affected = await this.userSessionRepository.update(
        userId,
        sessionId,
        { lastUsed: new Date() },
      );
      if (affected === 0) throw new NotFoundException('Session not found');
    } catch (error) {
      this.handleError(error, 'updating session last used');
    }
  }

  /**
   * Mapea una entidad a su DTO
   */
  private mapToResponseDto(session: any): UserSessionResponseDto {
    return plainToInstance(UserSessionResponseDto, session, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Valida parámetros de entrada
   */
  private validateParams(userId: string, sessionId: string): void {
    if (!userId || !sessionId) {
      throw new BadRequestException('User ID and Session ID are required');
    }
  }

  /**
   * Valida que el userId esté presente
   */
  private ensureUserId(userId: string): void {
    if (!userId) throw new BadRequestException('User ID is required');
  }

  /**
   * Maneja errores de forma centralizada
   */
  private handleError(error: any, context: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`Error ${context}: ${error.message}`, error.stack);
    throw new InternalServerErrorException(`Failed to ${context}`);
  }
}
