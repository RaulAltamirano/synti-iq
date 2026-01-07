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

  getSessionCacheKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }

  async getSessionValidity(userId: string, sessionId: string): Promise<boolean | undefined> {
    try {
      const cacheKey = this.getSessionCacheKey(userId, sessionId);
      return await this.cacheManager.get<boolean>(cacheKey);
    } catch (error) {
      this.logger.error(`Error getting session from cache: ${error.message}`, error.stack);
      return undefined;
    }
  }

  async setSessionValidity(userId: string, sessionId: string, isValid: boolean): Promise<void> {
    try {
      const cacheKey = this.getSessionCacheKey(userId, sessionId);
      await this.cacheManager.set(cacheKey, isValid, this.cacheTTL);
    } catch (error) {
      this.logger.error(`Error setting session in cache: ${error.message}`, error.stack);
    }
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    try {
      const cacheKey = this.getSessionCacheKey(userId, sessionId);
      await this.cacheManager.del(cacheKey);
    } catch (error) {
      this.logger.error(`Error deleting session from cache: ${error.message}`, error.stack);
    }
  }

  async clearAllCaches(): Promise<void> {
    try {
      if (this.cacheManager.stores && Array.isArray(this.cacheManager.stores)) {
        for (const store of this.cacheManager.stores) {
          if (store && typeof (store as any).clear === 'function') {
            await (store as any).clear();
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error clearing all caches: ${error.message}`, error.stack);
    }
  }
}
