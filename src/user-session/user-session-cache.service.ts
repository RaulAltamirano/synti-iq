import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class SessionCacheService {
  private readonly logger = new Logger(SessionCacheService.name);
  private readonly cacheTTL: number;

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.cacheTTL = this.configService.get<number>('SESSION_CACHE_TTL', 3600);
  }

  /**
   * Generate a cache key for a session
   * @param userId - The user's ID
   * @param sessionId - The session ID
   * @returns The cache key
   */
  getSessionCacheKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }

  /**
   * Get a cached session validity status
   * @param userId - The user's ID
   * @param sessionId - The session ID
   * @returns The cached value or undefined if not found
   */
  async getSessionValidity(
    userId: string,
    sessionId: string,
  ): Promise<boolean | undefined> {
    try {
      const cacheKey = this.getSessionCacheKey(userId, sessionId);
      return await this.cacheManager.get<boolean>(cacheKey);
    } catch (error) {
      this.logger.error(
        `Error getting session from cache: ${error.message}`,
        error.stack,
      );
      return undefined;
    }
  }

  /**
   * Set a session validity status in the cache
   * @param userId - The user's ID
   * @param sessionId - The session ID
   * @param isValid - Whether the session is valid
   */
  async setSessionValidity(
    userId: string,
    sessionId: string,
    isValid: boolean,
  ): Promise<void> {
    try {
      const cacheKey = this.getSessionCacheKey(userId, sessionId);
      await this.cacheManager.set(cacheKey, isValid, this.cacheTTL);
    } catch (error) {
      this.logger.error(
        `Error setting session in cache: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Delete a session from the cache
   * @param userId - The user's ID
   * @param sessionId - The session ID
   */
  async deleteSession(userId: string, sessionId: string): Promise<void> {
    try {
      const cacheKey = this.getSessionCacheKey(userId, sessionId);
      await this.cacheManager.del(cacheKey);
    } catch (error) {
      this.logger.error(
        `Error deleting session from cache: ${error.message}`,
        error.stack,
      );
    }
  }
}
