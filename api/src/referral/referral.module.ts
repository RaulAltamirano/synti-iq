import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralCode } from './entities/referral_code.entity';
import { ReferralUsage } from './entities/referral_usage.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { User } from 'src/user/entities/user.entity';
import { UserProfileModule } from 'src/user-profile/user_profile.module';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { ReferralMetricsService } from './services/referral-metrics.service';

@Module({
  imports: [
    UserProfileModule,
    TypeOrmModule.forFeature([ReferralCode, ReferralUsage, BusinessProfile, UserProfile, User]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService, ReferralMetricsService],
  exports: [ReferralService],
})
export class ReferralModule {}
