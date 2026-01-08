import { SetMetadata } from '@nestjs/common';
import { SystemRole } from 'src/shared/enums/roles.enum';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: SystemRole[]) => {
  return SetMetadata(META_ROLES, args);
};
