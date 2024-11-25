import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtHelperService } from './jwt-helper.service';

@Module({
  imports: [ConfigModule],
  providers: [JwtHelperService],
  exports: [JwtHelperService],
})
export class JwtHelperModule {}
