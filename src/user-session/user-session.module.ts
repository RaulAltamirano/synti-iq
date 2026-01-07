import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { UserSessionController } from './user-session.controller';
import { UserSession } from './entities/user-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionRepository } from './user-session.repository';
import { UserSessionCleanupService } from './user-session-cleanup.service';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  controllers: [UserSessionController],
  imports: [TypeOrmModule.forFeature([UserSession]), RedisModule],
  providers: [UserSessionService, UserSessionRepository, UserSessionCleanupService],
  exports: [UserSessionService],
})
export class UserSessionModule {}
