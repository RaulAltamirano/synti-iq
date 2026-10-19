import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesPermissionsGuard } from '../guards/user-role.guard';

export const META_ROLES = 'roles';
export const META_PERMISSIONS = 'permissions';

export function Auth(role: string = '', permissions: string[] = []) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesPermissionsGuard),
    SetMetadata(META_ROLES, role ? [role] : []),
    SetMetadata(META_PERMISSIONS, permissions),
  );
}
