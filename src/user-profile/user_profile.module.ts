import { Module } from '@nestjs/common';
import { UserProfileService } from './user_profile.service';
import { UserProfileController } from './user_profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { UserProfile } from './entities/user_profile.entity';
import { Store } from 'src/store/entities/store.entity';
import { User } from 'src/user/entities/user.entity';
import { ProfileFactoryService } from './services/profile-factory.service';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileActivityService } from './services/profile-activity.service';
import { ProfileApprovalService } from './services/profile-approval.service';
import {
  CashierProfileStrategy,
  DeliveryProfileStrategy,
  ProviderProfileStrategy,
  CustomerProfileStrategy,
} from './strategies/profile-creation.strategy';

@Module({
  controllers: [UserProfileController],
  providers: [
    UserProfileService,
    ProfileFactoryService,
    ProfileValidationService,
    ProfileActivityService,
    ProfileApprovalService,
    CashierProfileStrategy,
    DeliveryProfileStrategy,
    ProviderProfileStrategy,
    CustomerProfileStrategy,
  ],
  imports: [
    TypeOrmModule.forFeature([
      UserProfile,
      CashierProfile,
      DeliveryProfile,
      ProviderProfile,
      CustomerProfile,
      Subscription,
      Store,
      User,
    ]),
  ],
  exports: [UserProfileService],
})
export class UserProfileModule {}
