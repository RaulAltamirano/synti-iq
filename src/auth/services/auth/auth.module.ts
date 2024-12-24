import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';

import { DatabaseModule } from '../../../database/database.module';
import { AuthController } from './auth.controller';
import { RedisModule } from 'src/shared/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { PasswordModule } from '../password/password.module';
import { JwtHelperModule } from 'src/shared/jwt-helper/jwt-helper.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UserModule,
    DatabaseModule,
    PasswordModule,
    ConfigModule,
    RedisModule,
    JwtHelperModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
