import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { RedisModule } from 'src/shared/redis/redis.module';
import { AuthModule } from 'src/auth/auth.module';
import { databaseConfig } from 'src/database/database.config';
import { PermissionModule } from 'src/permission/permission.module';
import { RoleModule } from 'src/role/role.module';
import { PermissionGroupModule } from 'src/permission-group/permission-group.module';
import { LocationModule } from 'src/location/location.module';
import { StoreModule } from 'src/store/store.module';
import { BusinessProfileModule } from 'src/business-profile/business_profile.module';
import { ReferralModule } from 'src/referral/referral.module';
import { ProductModule } from 'src/product/product.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { SaleItemModule } from 'src/sale-item/sale-item.module';
import { SaleModule } from 'src/sale/sale.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { StoreScheduleModule } from 'src/store-schedule/store-schedule.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProductCategorieModule } from 'src/product-category/product-categorie.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ResponseModule } from 'src/shared/response/response.module';
import { LoggerModule } from 'src/shared/logger';
import { ObservabilityModule } from 'src/shared/observability';
import { MailModule } from 'src/mail/mail.module';
import { Resend } from 'resend';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    RedisModule,
    ObservabilityModule,
    LoggerModule,
    AuthModule,
    UserModule,
    PermissionModule,
    RoleModule,
    PermissionGroupModule,
    DatabaseModule,
    ProductModule,
    StoreModule,
    BusinessProfileModule,
    ReferralModule,
    InventoryModule,
    StoreScheduleModule,
    SaleItemModule,
    SaleModule,
    TransactionsModule,
    LocationModule,
    ProductCategorieModule,
    ResponseModule,
    MailModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('RESEND_API_KEY') ?? '';
        const from = config.get<string>('MAIL_FROM') ?? 'onboarding@resend.dev';
        const appUrl = config.get<string>('FRONTEND_URL') ?? 'https://app.syntiiq.com';
        return {
          resend: apiKey ? new Resend(apiKey) : null,
          from,
          appUrl,
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
