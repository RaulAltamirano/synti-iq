import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import { AddressRequiredGuard } from './guards/address-required.guard';

@Module({
  controllers: [LocationController],
  providers: [LocationService, AddressRequiredGuard],
  imports: [TypeOrmModule.forFeature([Location, User])],
  exports: [LocationService, AddressRequiredGuard],
})
export class LocationModule {}
