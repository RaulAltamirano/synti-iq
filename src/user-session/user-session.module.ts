import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { UserSessionController } from './user-session.controller';
import { UserSession } from './entities/user-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UserSessionRepository } from './user-session.repository';
import { SessionCacheService } from './user-session-cache.service';

@Module({
  controllers: [UserSessionController],
  imports: [TypeOrmModule.forFeature([UserSession]), CacheModule.register()],
  providers: [UserSessionService, UserSessionRepository, SessionCacheService],
  exports: [UserSessionService],
})
export class UserSessionModule {}
