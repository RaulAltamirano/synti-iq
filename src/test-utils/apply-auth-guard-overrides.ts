import type { TestingModuleBuilder } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesPermissionsGuard } from 'src/auth/guards/user-role.guard';

const noopGuard = { canActivate: (): boolean => true };

export function applyAuthGuardOverrides(builder: TestingModuleBuilder): TestingModuleBuilder {
  return builder
    .overrideGuard(JwtAuthGuard)
    .useValue(noopGuard)
    .overrideGuard(RolesPermissionsGuard)
    .useValue(noopGuard);
}

export function applyJwtAuthGuardOverride(builder: TestingModuleBuilder): TestingModuleBuilder {
  return builder.overrideGuard(JwtAuthGuard).useValue(noopGuard);
}
