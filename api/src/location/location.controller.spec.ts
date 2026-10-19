import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { applyAuthGuardOverrides } from 'src/test-utils/apply-auth-guard-overrides';

describe('LocationController', () => {
  let controller: LocationController;

  beforeEach(async () => {
    const module: TestingModule = await applyAuthGuardOverrides(
      Test.createTestingModule({
        controllers: [LocationController],
        providers: [{ provide: LocationService, useValue: {} }],
      }),
    ).compile();

    controller = module.get<LocationController>(LocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
