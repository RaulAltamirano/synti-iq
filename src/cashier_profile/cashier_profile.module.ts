import { Module } from '@nestjs/common';
import { CashierProfileStrategy } from './strategy/CashierProfileStrategy';
import { CashierProfile } from './entities/cashier_profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CashierProfile])],
  providers: [CashierProfileStrategy],
  exports: [CashierProfileStrategy, TypeOrmModule],
})
export class CashierProfileModule {}
