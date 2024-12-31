import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class RateLimiterService {
  // constructor(
  //   private readonly redisService: RedisService,
  //   private readonly configService: ConfigService,
  // ) {}
  // async checkRateLimit(
  //   identifier: string,
  //   action: keyof typeof RATE_LIMIT_RULES,
  // ): Promise<boolean> {
  //   const rule = RATE_LIMIT_RULES[action];
  //   const key = `rateLimit:${action}:${identifier}`;
  //   const multi = this.redisService.multi();
  //   multi.incr(key);
  //   multi.expire(key, rule.windowSeconds);
  //   const [count] = await multi.exec();
  //   return parseInt(count) <= rule.maxAttempts;
  // }
}
