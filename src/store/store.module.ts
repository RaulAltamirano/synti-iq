import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreQueryService } from './services/store-query.service';
import { StoreMutationService } from './services/store-mutation.service';
import { StoreCashierService } from './services/store-cashier.service';
import { Store } from './entities/store.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';
import { Location } from 'src/location/entities/location.entity';
import { GuardsModule } from 'src/auth/guards/guards.module';
import { LocationModule } from 'src/location/location.module';
import { UserProfileModule } from 'src/user-profile/user_profile.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService, StoreQueryService, StoreMutationService, StoreCashierService],
  imports: [
    GuardsModule,
    CacheModule.register(),
    LocationModule,
    UserProfileModule,
    UserModule,
    AuthModule,
    TypeOrmModule.forFeature([Store, Location, CashierProfile, StoreSchedule, PaymentMethod]),
  ],
  exports: [StoreService, TypeOrmModule],
})
export class StoreModule {}
