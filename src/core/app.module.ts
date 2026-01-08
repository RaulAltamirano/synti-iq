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
import { ProductModule } from 'src/product/product.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { SaleItemModule } from 'src/sale-item/sale-item.module';
import { SaleModule } from 'src/sale/sale.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { CashierScheduleAssignmentModule } from 'src/cashier-schedule-assignment/cashier-schedule-assignment.module';
import { RecurringScheduleTemplateModule } from 'src/recurring-schedule-template/recurring-schedule-template.module';
import { StoreScheduleModule } from 'src/store-schedule/store-schedule.module';
import { TimeBlockModule } from 'src/time-block/time-block.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProductCategorieModule } from 'src/product-categorie/product-categorie.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ResponseModule } from 'src/shared/response/response.module';

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
    AuthModule,
    UserModule,
    PermissionModule,
    RoleModule,
    PermissionGroupModule,
    DatabaseModule,
    RedisModule,
    ProductModule,
    StoreModule,
    InventoryModule,
    CashierScheduleAssignmentModule,
    RecurringScheduleTemplateModule,
    StoreScheduleModule,
    SaleItemModule,
    SaleModule,
    TransactionsModule,
    LocationModule,
    TimeBlockModule,
    ProductCategorieModule,
    ResponseModule,
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
