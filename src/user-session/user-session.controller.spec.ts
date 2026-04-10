import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './user-session.service';
import { applyJwtAuthGuardOverride } from 'src/test-utils/apply-auth-guard-overrides';

describe('UserSessionController', () => {
  let controller: UserSessionController;

  beforeEach(async () => {
    const module: TestingModule = await applyJwtAuthGuardOverride(
      Test.createTestingModule({
        controllers: [UserSessionController],
        providers: [{ provide: UserSessionService, useValue: {} }],
      }),
    ).compile();

    controller = module.get<UserSessionController>(UserSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
