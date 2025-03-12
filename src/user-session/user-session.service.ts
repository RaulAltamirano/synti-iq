import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  Injectable,
  Logger,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);
  private readonly cacheTTL = 3600; // 1 hora en segundos

  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private getSessionCacheKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }

  async validateSessionOwnership(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    if (!userId || !sessionId) {
      return false;
    }

    const cacheKey = this.getSessionCacheKey(userId, sessionId);

    try {
      // En cache-manager v5, get devuelve el valor directamente
      const cachedSession = await this.cacheManager.get(cacheKey);
      if (cachedSession !== undefined) {
        return Boolean(cachedSession);
      }

      // Si no está en caché, consultar la base de datos
      const session = await this.userSessionRepository.findOne({
        where: {
          userId,
          sessionId,
          isValid: true,
        },
        select: ['id', 'userId', 'sessionId', 'isValid'],
      });

      const isValid = !!session;

      // En cache-manager v5, set acepta key, value, y options
      await this.cacheManager.set(cacheKey, isValid, this.cacheTTL);

      return isValid;
    } catch (error) {
      this.logger.error(
        `Error validating session ownership: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    try {
      await this.userSessionRepository.update(
        { userId, sessionId },
        { isValid: false },
      );
      // Actualizar la caché inmediatamente
      const cacheKey = this.getSessionCacheKey(userId, sessionId);
      await this.cacheManager.set(cacheKey, false, this.cacheTTL);
    } catch (error) {
      this.logger.error(
        `Error invalidating session: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to invalidate session');
    }
  }

  async saveUserSession(
    userId: string,
    sessionData: Partial<UserSession>,
  ): Promise<UserSession> {
    try {
      const session = this.userSessionRepository.create({
        userId,
        ...sessionData,
      });
      const savedSession = await this.userSessionRepository.save(session);

      // Actualizar caché con la nueva sesión
      if (savedSession && savedSession.sessionId) {
        const cacheKey = this.getSessionCacheKey(
          userId,
          savedSession.sessionId,
        );
        await this.cacheManager.set(cacheKey, true, this.cacheTTL);
      }

      return savedSession;
    } catch (error) {
      this.logger.error(
        `Error saving user session: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to save user session');
    }
  }

  async invalidateAllSessions(userId: string): Promise<void> {
    try {
      // Primero obtenemos todas las sesiones activas para actualizar la caché
      const activeSessions = await this.getActiveSessions(userId);

      // Actualizamos la base de datos
      await this.userSessionRepository.update({ userId }, { isValid: false });

      // Actualizamos la caché para cada sesión
      const cacheUpdates = activeSessions.map((session) =>
        this.cacheManager.set(
          this.getSessionCacheKey(userId, session.sessionId),
          false,
          this.cacheTTL,
        ),
      );

      await Promise.all(cacheUpdates);
    } catch (error) {
      this.logger.error(
        `Error invalidating all sessions: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to invalidate all sessions',
      );
    }
  }

  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return this.userSessionRepository.find({
      where: { userId, isValid: true },
    });
  }

  async cleanupExpiredSessions(expirationDays: number = 30): Promise<void> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - expirationDays);

      await this.userSessionRepository.delete({
        lastUsed: LessThan(expirationDate),
      });

      this.logger.log(`Cleaned up sessions older than ${expirationDays} days`);
    } catch (error) {
      this.logger.error(
        `Error cleaning up expired sessions: ${error.message}`,
        error.stack,
      );
    }
  }

  async findSessionById(
    userId: string,
    sessionId: string,
  ): Promise<UserSession | null> {
    return this.userSessionRepository.findOne({
      where: {
        userId,
        sessionId,
        isValid: true,
      },
    });
  }

  async updateSessionLastUsed(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    await this.userSessionRepository.update(
      { userId, sessionId },
      { lastUsed: new Date() },
    );
  }
}
