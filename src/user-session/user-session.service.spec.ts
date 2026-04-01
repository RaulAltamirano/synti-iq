import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserSessionService } from './user-session.service';
import { UserSessionRepository } from './user-session.repository';
import { RedisService } from 'src/shared/redis/redis.service';

describe('UserSessionService', () => {
  let service: UserSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSessionService,
        {
          provide: UserSessionRepository,
          useValue: {
            findByUserAndSessionId: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: RedisService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserSessionService>(UserSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
