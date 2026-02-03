import { Module } from '@nestjs/common';
import { DeliveryProfilesService } from './delivery_profiles.service';

@Module({
  providers: [DeliveryProfilesService],
})
export class DeliveryProfilesModule {}
