import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from 'src/store/entities/store.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { Location } from 'src/location/entities/location.entity';
import { LocationService } from 'src/location/location.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { DateUtils } from 'src/shared/utils/date-utils';
import { CreateStoreDto } from 'src/store/dto/create-store.dto';
import { StoreQueryService } from './store-query.service';

@Injectable()
export class StoreMutationService {
  private readonly logger = new Logger(StoreMutationService.name);

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    private readonly locationService: LocationService,
    private readonly userProfileService: UserProfileService,
    private readonly storeQueryService: StoreQueryService,
  ) {}

  async create(input: CreateStoreDto, userId: string): Promise<Store> {
    try {
      const profile = await this.userProfileService.getUserProfile(userId);
      if (!profile?.profileId || profile.profileType !== SystemRole.BUSINESS_OWNER) {
        throw new ForbiddenException('Only business owners can create stores');
      }

      const businessProfileId = profile.profileId;

      const existingStore = await this.storeRepo.findOne({
        where: { name: input.name, businessProfileId },
      });
      if (existingStore) {
        throw new ConflictException('A store with this name already exists');
      }

      let location: Location | null = null;
      if (input.location) {
        location = await this.locationService.createLocation(input.location);
      }

      const { schedules: scheduleItems, ...storeInput } = input;
      const scheduleRows = scheduleItems?.length ? scheduleItems : null;

      if (scheduleRows) {
        const saved = await this.storeRepo.manager.transaction(async tx => {
          const store = this.storeRepo.create({
            ...storeInput,
            location,
            businessProfileId,
            isActive: input.isActive ?? true,
          });
          store.schedules = scheduleRows.map(item => {
            const schedule = new StoreSchedule();
            schedule.name = item.name ?? item.dayOfWeek;
            schedule.description = item.description;
            schedule.dayOfWeek = item.dayOfWeek;
            schedule.openTime = DateUtils.normalizeTimeStringForPg(item.openTime);
            schedule.closeTime = DateUtils.normalizeTimeStringForPg(item.closeTime);
            schedule.store = store;
            schedule.isActive = true;
            return schedule;
          });
          return tx.getRepository(Store).save(store);
        });

        await this.storeQueryService.invalidateListCache();
        const withSchedules = await this.storeRepo.findOne({
          where: { id: saved.id },
          relations: ['schedules'],
        });
        return withSchedules ?? saved;
      }

      const store = this.storeRepo.create({
        ...storeInput,
        location,
        businessProfileId,
        isActive: input.isActive ?? true,
      });

      const saved = await this.storeRepo.save(store);
      await this.storeQueryService.invalidateListCache();
      return saved;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to create store', stack, StoreMutationService.name);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(message);
    }
  }

  async remove(id: string, userId?: string): Promise<void> {
    await this.storeQueryService.findOne(id, userId);

    try {
      await this.storeRepo.softDelete(id);
      await this.storeQueryService.invalidateListCache();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error soft-deleting store', stack, StoreMutationService.name);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(message);
    }
  }
}
