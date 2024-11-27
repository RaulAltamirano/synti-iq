import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';

import { DatabaseModule } from '../../database/database.module';
import { JwtHelperModule } from 'src/shared/jwt-helper/jwt-helper.module';
import { AuthController } from './auth.controller';
import { PasswordService } from './password.service';
import { RedisModule } from 'src/shared/redis/redis.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    UserModule,
    DatabaseModule,
    RedisModule,
    ConfigModule,
    JwtHelperModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
