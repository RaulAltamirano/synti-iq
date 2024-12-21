// import { Role } from 'src/user/enums/roles.enum';
// import { Permission } from 'src/user/enums/permissions.enum';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const META_ROLES = 'roles';
export const META_PERMISSIONS = 'permissions';

export function Auth(roles: string[] = [], permissions: string[] = []) {
  return applyDecorators(
    UseGuards(AuthGuard()),
    SetMetadata(META_ROLES, roles),
    SetMetadata(META_PERMISSIONS, permissions),
  );
}
