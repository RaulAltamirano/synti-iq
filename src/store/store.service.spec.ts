import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { StoreService } from './store.service';
import { Store } from './entities/store.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { LocationService } from 'src/location/location.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { UserService } from 'src/user/user.service';

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      })),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getRepositoryToken(Store), useValue: mockRepo },
        {
          provide: getRepositoryToken(CashierProfile),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        { provide: LocationService, useValue: { createLocation: jest.fn() } },
        { provide: UserProfileService, useValue: { getUserProfile: jest.fn() } },
        { provide: UserService, useValue: { getUserRole: jest.fn() } },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
