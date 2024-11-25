import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
// import * as jwt from 'jsonwebtoken';

// import { RolesGuard } from './guards/roles.guard';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { JwtHelperModule } from 'src/shared/jwt-helper/jwt-helper.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    UserModule,
    DatabaseModule,
    ConfigModule,
    JwtHelperModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
