import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtHelperService } from './jwt-helper.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  providers: [JwtHelperService, JwtStrategy],
  exports: [JwtHelperService, JwtStrategy],
})
export class JwtHelperModule {}
