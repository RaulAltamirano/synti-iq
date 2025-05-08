import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly defaultTTL = 300; 
  private readonly staleWhileRevalidateTTL = 600; 

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      ttl?: number;
      staleWhileRevalidate?: boolean;
    } = {},
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    
    if (cached) {
      if (options.staleWhileRevalidate) {
        // Fetch fresh data in background
        fetchFn()
          .then(newValue => 
            this.cacheManager.set(
              key,
              newValue,
              options.ttl || this.defaultTTL
            )
          )
          .catch(error => {
            console.error(`Error refreshing cache for key ${key}:`, error);
          });
      }
      return cached;
    }

    const value = await fetchFn();
    await this.cacheManager.set(
      key,
      value,
      options.ttl || this.defaultTTL
    );
    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    await this.cacheManager.del(pattern);
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
}