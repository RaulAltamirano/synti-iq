import { Module } from '@nestjs/common';
import { UserProfileService } from './user_profile.service';
import { UserProfileController } from './user_profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery_profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider_profile/entities/provider_profile.entity';
import { UserProfile } from './entities/user_profile.entity';
import { Store } from 'src/store/entities/store.entity';

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService],
  imports: [
    TypeOrmModule.forFeature([
      UserProfile,
      CashierProfile,
      DeliveryProfile,
      ProviderProfile,
      Store,
    ]),
  ],
  exports: [UserProfileService],
})
export class UserProfileModule {}
