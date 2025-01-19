import { Module } from '@nestjs/common';
import { RedisModule } from 'src/shared/redis/redis.module';
import { PasswordService } from './password.service';

@Module({
  imports: [RedisModule],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
