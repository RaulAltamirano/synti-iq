import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export const META_ROLES = 'roles';
export const META_PERMISSIONS = 'permissions';

export function Auth(roles: string[] = [], permissions: string[] = []) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata(META_ROLES, roles),
    SetMetadata(META_PERMISSIONS, permissions),
  );
}
