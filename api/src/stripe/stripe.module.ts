import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../location/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}