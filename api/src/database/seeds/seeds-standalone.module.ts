import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Permission } from 'src/permission/entities/permission.entity';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { SubscriptionPlan } from 'src/subscription/entities/subscription-plan.entity';

import { Store } from 'src/store/entities/store.entity';
import { Location } from 'src/location/entities/location.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Product } from 'src/product/entities/product.entity';
import { ProductCategorie } from 'src/product-category/entities/product-categorie.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { SaleItem } from 'src/sale-item/entities/sale-item.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';
import { CashRegisterSession } from 'src/cash-register-session/entities/cash_register_session.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import { DefaultProfile } from 'src/default-profile/entities/default_profile.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { ReferralCode } from 'src/referral/entities/referral_code.entity';
import { ReferralUsage } from 'src/referral/entities/referral_usage.entity';
import { AccountInvitation } from 'src/auth/entities/account-invitation.entity';
import { UserBackupCode } from 'src/auth/entities/user-backup-code.entity';

import { PermissionsSeed } from './permissions.seed';
import { PermissionGroupsSeed } from './permission-groups.seed';
import { RolesSeed } from './roles.seed';
import { SubscriptionPlansSeed } from './subscription-plans.seed';
import { UsersSeed } from './users.seed';

import { PasswordModule } from 'src/auth/services/password/password.module';

const seedEntities = [
  Permission,
  PermissionGroup,
  Role,
  User,
  UserProfile,
  BusinessProfile,
  SubscriptionPlan,
  Store,
  Location,
  Inventory,
  Product,
  ProductCategorie,
  Sale,
  SaleItem,
  Transaction,
  StoreSchedule,
  CashierProfile,
  PaymentMethod,
  CashRegisterSession,
  CustomerProfile,
  DefaultProfile,
  Subscription,
  ReferralCode,
  ReferralUsage,
  AccountInvitation,
  UserBackupCode,
];

const seedsDatabaseConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: seedEntities,
  autoLoadEntities: false,
  synchronize: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: seedsDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Permission,
      PermissionGroup,
      Role,
      User,
      UserProfile,
      BusinessProfile,
      SubscriptionPlan,
    ]),
    PasswordModule,
  ],
  providers: [
    PermissionsSeed,
    PermissionGroupsSeed,
    RolesSeed,
    SubscriptionPlansSeed,
    UsersSeed,
  ],
  exports: [
    PermissionsSeed,
    PermissionGroupsSeed,
    RolesSeed,
    SubscriptionPlansSeed,
    UsersSeed,
  ],
})
export class SeedsStandaloneModule {}