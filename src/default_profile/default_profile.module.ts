import { Module } from '@nestjs/common';
import { DefaultProfileService } from './default_profile.service';
import { DefaultProfileController } from './default_profile.controller';
import { DefaultProfileStrategy } from './strategy/DefaultProfileStrategy.strategy';
import { DefaultProfile } from './entities/default_profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from 'src/location/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DefaultProfile, Location])],
  controllers: [DefaultProfileController],
  providers: [DefaultProfileService, DefaultProfileStrategy],
  exports: [DefaultProfileStrategy, TypeOrmModule],
})
export class DefaultProfileModule { }
