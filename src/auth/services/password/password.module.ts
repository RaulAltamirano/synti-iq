import { Module } from '@nestjs/common';
import { RedisModule } from 'src/shared/redis/redis.module';
import { PasswordService } from './password.service';
import { HashingStrategy } from './strategies/hashing.strategy.ts';
import { LockoutStrategy } from './strategies/lockout.strategy';
import { PepperStrategy } from './strategies/pepper.strategy';

@Module({
  imports: [RedisModule],
  providers: [
    PasswordService,
    HashingStrategy,
    LockoutStrategy,
    PepperStrategy,
  ],
  exports: [PasswordService],
})
export class PasswordModule {}
