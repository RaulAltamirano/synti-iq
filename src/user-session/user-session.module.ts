import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { UserSessionController } from './user-session.controller';
import { UserSession } from './entities/user-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [UserSessionController],
  imports: [TypeOrmModule.forFeature([UserSession]), CacheModule.register()],
  providers: [UserSessionService],
  exports: [UserSessionService],
})
export class UserSessionModule {}
