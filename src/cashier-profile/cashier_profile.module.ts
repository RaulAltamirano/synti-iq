import { Module } from '@nestjs/common';
import { CashierProfile } from './entities/cashier_profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from 'src/store/entities/store.entity';
import { CashierProfileService } from './cashier_profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([CashierProfile, Store])],
  providers: [CashierProfileService],
  exports: [CashierProfileService, TypeOrmModule],
})
export class CashierProfileModule {}
