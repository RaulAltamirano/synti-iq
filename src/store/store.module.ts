import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { Store } from './entities/store.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Location } from 'src/location/entities/location.entity';
import { LocationModule } from 'src/location/location.module';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  imports: [
    CacheModule.register(),
    LocationModule,
    TypeOrmModule.forFeature([
      Store,
      Location,
      CashierProfile,
      Inventory,
      Sale,
      StoreSchedule,
      RecurringScheduleTemplate,
      PaymentMethod,
      CashierScheduleAssignment,
    ]),
  ],
  exports: [StoreService, TypeOrmModule],
})
export class StoreModule {}
