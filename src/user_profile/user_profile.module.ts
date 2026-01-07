import { Module } from '@nestjs/common';
import { UserProfileService } from './user_profile.service';
import { UserProfileController } from './user_profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { DefaultProfile } from 'src/default_profile/entities/default_profile.entity';
import { CashierProfileStrategy } from 'src/cashier_profile/strategy/CashierProfileStrategy';
import { DefaultProfileStrategy } from 'src/default_profile/strategy/DefaultProfileStrategy.strategy';
import { IProfileStrategy } from 'src/user/strategy/IProfileStrategy';

@Module({
  controllers: [UserProfileController],
  providers: [
    UserProfileService,
    CashierProfileStrategy,
    DefaultProfileStrategy,
    {
      provide: 'PROFILE_STRATEGIES',
      useFactory: (...strategies: IProfileStrategy[]) => strategies,
      inject: [CashierProfileStrategy, DefaultProfileStrategy],
    },
  ],
  imports: [TypeOrmModule.forFeature([DefaultProfile, CashierProfile])],
  exports: [UserProfileService],
})
export class UserProfileModule {}
