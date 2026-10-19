import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StoreMutationService } from './store-mutation.service';
import { StoreQueryService } from './store-query.service';
import { Store } from 'src/store/entities/store.entity';
import { LocationService } from 'src/location/location.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { SystemRole } from 'src/shared/enums/roles.enum';

describe('StoreMutationService', () => {
  let service: StoreMutationService;
  let storeRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let userProfileService: { getUserProfile: jest.Mock };
  let storeQueryService: { findOne: jest.Mock; invalidateListCache: jest.Mock };

  beforeEach(async () => {
    storeRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation(dto => dto),
      save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'store-id', ...entity })),
      softDelete: jest.fn().mockResolvedValue(undefined),
      manager: {
        transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) =>
          fn({
            getRepository: jest.fn().mockReturnValue({
              save: jest.fn().mockResolvedValue({ id: 'store-id' }),
            }),
          }),
        ),
      },
    };
    userProfileService = { getUserProfile: jest.fn() };
    storeQueryService = {
      findOne: jest.fn(),
      invalidateListCache: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreMutationService,
        { provide: getRepositoryToken(Store), useValue: storeRepo },
        { provide: LocationService, useValue: { createLocation: jest.fn() } },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: StoreQueryService, useValue: storeQueryService },
      ],
    }).compile();

    service = module.get<StoreMutationService>(StoreMutationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws ForbiddenException when user is not a BUSINESS_OWNER', async () => {
      userProfileService.getUserProfile.mockResolvedValue({
        profileId: 'cashier-id',
        profileType: SystemRole.CASHIER,
      });

      await expect(service.create({ name: 'My Store' } as never, 'user-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws ConflictException when store name already exists for the business', async () => {
      userProfileService.getUserProfile.mockResolvedValue({
        profileId: 'bp-1',
        profileType: SystemRole.BUSINESS_OWNER,
      });
      storeRepo.findOne.mockResolvedValue({ id: 'existing-store' });

      await expect(
        service.create({ name: 'Existing Store' } as never, 'owner-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('saves store without schedules using storeRepo.save directly', async () => {
      userProfileService.getUserProfile.mockResolvedValue({
        profileId: 'bp-1',
        profileType: SystemRole.BUSINESS_OWNER,
      });
      storeRepo.findOne.mockResolvedValue(null);

      const result = await service.create(
        { name: 'New Store', schedules: undefined } as never,
        'owner-1',
      );

      expect(storeRepo.save).toHaveBeenCalled();
      expect(storeQueryService.invalidateListCache).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('wraps schedule creation in a transaction', async () => {
      userProfileService.getUserProfile.mockResolvedValue({
        profileId: 'bp-1',
        profileType: SystemRole.BUSINESS_OWNER,
      });
      storeRepo.findOne
        .mockResolvedValueOnce(null) // duplicate name check
        .mockResolvedValueOnce({ id: 'store-id', schedules: [] }); // post-create fetch

      const scheduleItem = {
        name: 'Monday',
        dayOfWeek: 'MONDAY',
        openTime: '09:00',
        closeTime: '18:00',
        description: '',
      };

      await service.create({ name: 'New Store', schedules: [scheduleItem] } as never, 'owner-1');

      expect(storeRepo.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('calls softDelete after findOne succeeds', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 'store-1' });

      await service.remove('store-1', 'owner-1');

      expect(storeRepo.softDelete).toHaveBeenCalledWith('store-1');
      expect(storeQueryService.invalidateListCache).toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when softDelete fails', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 'store-1' });
      storeRepo.softDelete.mockRejectedValue(new Error('DB error'));

      await expect(service.remove('store-1', 'owner-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
