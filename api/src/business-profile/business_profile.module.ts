import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessProfile } from './entities/business_profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessProfile])],
  exports: [TypeOrmModule],
})
export class BusinessProfileModule {}
