import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from 'src/permission/permission.service';
import { UserRoleService } from 'src/user-role/user-role.service';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionService,
    private readonly userRolesService: UserRoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const requiredPermissions =
      this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BadRequestException('Usuario no autenticado');
    }

    if (requiredRoles.length > 0) {
      const userRoles = await this.userRolesService.getUserRoles(user.id);
      const hasValidRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasValidRole) {
        throw new ForbiddenException(
          `El usuario no tiene los roles requeridos: ${requiredRoles.join(', ')}`,
        );
      }
    }

    if (requiredPermissions.length > 0) {
      const userPermissions = await this.permissionsService.getUserPermissions(user.id);
      const hasValidPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission),
      );

      if (!hasValidPermissions) {
        throw new ForbiddenException(
          `El usuario no tiene los permisos requeridos: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
