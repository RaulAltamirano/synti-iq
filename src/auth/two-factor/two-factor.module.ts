import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/shared/redis/redis.module';
import { GuardsModule } from 'src/auth/guards/guards.module';
import { ObservabilityModule } from 'src/shared/observability';
import { User } from 'src/user/entities/user.entity';
import { UserBackupCode } from 'src/auth/entities/user-backup-code.entity';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorController } from './two-factor.controller';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    ObservabilityModule,
    GuardsModule,
    TypeOrmModule.forFeature([User, UserBackupCode]),
  ],
  controllers: [TwoFactorController],
  providers: [TwoFactorService],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
