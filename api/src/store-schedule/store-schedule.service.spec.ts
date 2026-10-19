import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { StoreScheduleService } from './store-schedule.service';
import { StoreScheduleRepository } from './repositories/store-schedule.repository';

describe('StoreScheduleService', () => {
  let service: StoreScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreScheduleService,
        {
          provide: StoreScheduleRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    service = module.get<StoreScheduleService>(StoreScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
