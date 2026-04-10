import { Module } from '@nestjs/common';
import { CustomerProfile } from './entities/customer_profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfileService } from './customer_profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfile])],
  providers: [CustomerProfileService],
  exports: [CustomerProfileService, TypeOrmModule],
})
export class CustomerProfileModule {}
