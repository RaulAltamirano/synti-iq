import { Module } from '@nestjs/common';
import { DeliveryProfilesService } from './delivery_profiles.service';
import { DeliveryProfilesResolver } from './delivery_profiles.resolver';

@Module({
  providers: [DeliveryProfilesResolver, DeliveryProfilesService],
})
export class DeliveryProfilesModule {}
