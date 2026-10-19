import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderProfile } from './entities/provider_profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderProfile])],
  exports: [TypeOrmModule],
})
export class ProviderProfileModule {}
