import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { applyAuthGuardOverrides } from 'src/test-utils/apply-auth-guard-overrides';

describe('RoleController', () => {
  let controller: RoleController;

  beforeEach(async () => {
    const module: TestingModule = await applyAuthGuardOverrides(
      Test.createTestingModule({
        controllers: [RoleController],
        providers: [{ provide: RoleService, useValue: {} }],
      }),
    ).compile();

    controller = module.get<RoleController>(RoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
