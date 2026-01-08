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
import { BearerTokenExtractor } from './strategies/bearer-token-xtractor';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { GuardsModule } from './guards/guards.module';
import { UserProfileModule } from 'src/user_profile/user_profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenFactory,
    JwtStrategy,
    CookieTokenExtractor,
    BearerTokenExtractor,
    {
      provide: TokenExtractorChain,
      useFactory: (
        cookieExtractor: CookieTokenExtractor,
        bearerExtractor: BearerTokenExtractor,
      ) => {
        return new TokenExtractorChain([cookieExtractor, bearerExtractor]);
      },
      inject: [CookieTokenExtractor, BearerTokenExtractor],
    },
    TokenFormatValidator,
    AnomalyDetectionService,
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
    TypeOrmModule.forFeature([User, Role]),
  ],
  exports: [AuthService, PassportModule, GuardsModule],
})
export class AuthModule {}
