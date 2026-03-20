import { Module } from '@nestjs/common';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionPlan])],
  providers: [SubscriptionService],
  exports: [SubscriptionService, TypeOrmModule],
})
export class SubscriptionModule {}
