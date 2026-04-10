import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';
import { RedisModule } from 'src/shared/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { UserSessionModule } from 'src/user-session/user-session.module';
import { TokenFactory } from 'src/auth/factory/token-factory';
import { DatabaseModule } from 'src/database/database.module';
import { PasswordModule } from './services/password/password.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from 'src/shared/jwt-helper/jwt.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenExtractorChain } from './strategies/token-extractor-chain';
import { TokenFormatValidator } from './strategies/token-format.validator';
import { CookieTokenExtractor } from './strategies/cookie-token-extractor';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { GuardsModule } from './guards/guards.module';
import { UserProfileModule } from 'src/user-profile/user_profile.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { AuthSessionManager } from './services/auth-session-manager.service';
import { AuthMetadataService } from './services/auth-metadata.service';
import { RateLimitService } from './services/rate-limit.service';
import { ReferralModule } from 'src/referral/referral.module';
import { TwoFactorService } from './services/two-factor.service';
import { UserBackupCode } from './entities/user-backup-code.entity';
import { ObservabilityModule } from 'src/shared/observability/observability.module';
import { SessionService } from './session/session.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    TwoFactorService,
    TokenFactory,
    JwtStrategy,
    CookieTokenExtractor,
    {
      provide: TokenExtractorChain,
      useFactory: (cookieExtractor: CookieTokenExtractor) => {
        return new TokenExtractorChain([cookieExtractor]);
      },
      inject: [CookieTokenExtractor],
    },
    TokenFormatValidator,
    AnomalyDetectionService,
    AuthSessionManager,
    AuthMetadataService,
    RateLimitService,
    SessionService,
  ],
  imports: [
    UserModule,
    UserSessionModule,
    JwtModule,
    DatabaseModule,
    PasswordModule,
    ConfigModule,
    RedisModule,
    CacheModule.register(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    GuardsModule,
    UserProfileModule,
    SubscriptionModule,
    ReferralModule,
    ObservabilityModule,
    TypeOrmModule.forFeature([User, Role, Subscription, UserBackupCode]),
  ],
  exports: [AuthService, TwoFactorService, PassportModule, GuardsModule],
})
export class AuthModule {}
