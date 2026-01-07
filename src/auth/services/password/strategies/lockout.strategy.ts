import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/shared/redis/redis.service';
import { LOCKOUT_DURATION, MAX_LOGIN_ATTEMPTS } from '../interfaces/password.constants';

@Injectable()
export class LockoutStrategy {
  constructor(private readonly redisService: RedisService) {}

  async checkLockout(identifier: string): Promise<void> {
    const lockoutKey = this.getLockoutKey(identifier);
    const isLocked = await this.redisService.get(lockoutKey);

    if (isLocked) {
      throw new UnauthorizedException('Account temporarily locked. Please try again later.');
    }
  }

  async recordFailedAttempt(identifier: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(identifier);
    const attempts = await this.redisService.incr(attemptsKey);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutKey = this.getLockoutKey(identifier);
      await this.redisService.set(lockoutKey, '1', LOCKOUT_DURATION);
      throw new UnauthorizedException('Too many failed attempts. Account locked temporarily.');
    }

    if (attempts === 1) {
      await this.redisService.expire(attemptsKey, LOCKOUT_DURATION);
    }
  }

  async resetAttempts(identifier: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(identifier);
    await this.redisService.del(attemptsKey);
  }

  private getAttemptsKey(identifier: string): string {
    return `login_attempts:${identifier}`;
  }

  private getLockoutKey(identifier: string): string {
    return `account_lockout:${identifier}`;
  }
}
