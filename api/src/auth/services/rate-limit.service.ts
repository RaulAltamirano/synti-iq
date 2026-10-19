import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class RateLimitService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_WINDOW = 15 * 60; // 15 minutes in seconds

  constructor(private readonly redisService: RedisService) {}

  async checkRateLimit(email: string, ip: string): Promise<void> {
    const key = `login_attempts:${email}:${ip}`;
    const attempts = await this.redisService.incr(key);

    if (attempts === 1) {
      await this.redisService.expire(key, this.LOGIN_ATTEMPT_WINDOW);
    }

    if (attempts > this.MAX_LOGIN_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async clearRateLimit(email: string, ip: string): Promise<void> {
    const key = `login_attempts:${email}:${ip}`;
    await this.redisService.del(key);
  }
}
