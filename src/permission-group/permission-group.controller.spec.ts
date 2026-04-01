import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PermissionGroupController } from './permission-group.controller';
import { PermissionGroupService } from './permission-group.service';
import { applyAuthGuardOverrides } from 'src/test-utils/apply-auth-guard-overrides';

describe('PermissionGroupController', () => {
  let controller: PermissionGroupController;

  beforeEach(async () => {
    const module: TestingModule = await applyAuthGuardOverrides(
      Test.createTestingModule({
        controllers: [PermissionGroupController],
        providers: [{ provide: PermissionGroupService, useValue: {} }],
      }),
    ).compile();

    controller = module.get<PermissionGroupController>(PermissionGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
