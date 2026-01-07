import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtTokenStrategy } from './strategies/token-strategy';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  providers: [JwtService, JwtTokenStrategy],
  exports: [JwtService],
})
export class JwtModule {}
