import { Module } from '@nestjs/common';
import { StoreScheduleService } from './store-schedule.service';
import { StoreScheduleController } from './store-schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSchedule } from './entities/store-schedule.entity';
import { Store } from 'src/store/entities/store.entity';
import { StoreScheduleRepository } from './repositories/store-schedule.repository';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [StoreScheduleController],
  providers: [StoreScheduleService, StoreScheduleRepository],
  imports: [
    TypeOrmModule.forFeature([StoreSchedule, Store]),
    CacheModule.register({
      ttl: 3600, // 1 hour in seconds
      max: 100, // maximum number of items in cache
    }),
  ],
  exports: [StoreScheduleService, TypeOrmModule],
})
export class StoreScheduleModule {}
