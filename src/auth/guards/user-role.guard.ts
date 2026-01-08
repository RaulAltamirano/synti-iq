import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PermissionService } from 'src/permission/permission.service';
import { UserService } from 'src/user/user.service';
import { UserProfileService } from 'src/user_profile/user_profile.service';
import { SystemRole } from 'src/shared/enums/roles.enum';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  private readonly CACHE_TTL = 300;
  private readonly ROLE_CACHE_PREFIX = 'user:role:';
  private readonly PERMISSIONS_CACHE_PREFIX = 'user:permissions:';
  private permissionsService: PermissionService;
  private userService: UserService;
  private userProfileService: UserProfileService;

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const requiredPermissions =
      this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
      return true;
    }

    if (!this.permissionsService) {
      this.permissionsService = this.moduleRef.get(PermissionService, { strict: false });
    }
    if (!this.userService) {
      this.userService = this.moduleRef.get(UserService, { strict: false });
    }
    if (!this.userProfileService) {
      this.userProfileService = this.moduleRef.get(UserProfileService, { strict: false });
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BadRequestException('Usuario no autenticado');
    }

    this.validateUserStatus(user);

    if (requiredRoles.length > 0) {
      const userRole = await this.getUserRoleCached(user.id);
      if (!userRole) {
        throw new ForbiddenException('El usuario no tiene un rol asignado');
      }
      const hasValidRole = requiredRoles.includes(userRole);

      if (!hasValidRole) {
        throw new ForbiddenException(
          `El usuario no tiene los roles requeridos: ${requiredRoles.join(', ')}`,
        );
      }

      const rolesRequiringProfile = [SystemRole.CASHIER, SystemRole.DELIVERY, SystemRole.PROVIDER];
      if (rolesRequiringProfile.includes(userRole as SystemRole)) {
        const profileValidation = await this.userProfileService.validateProfileCoherence(user.id);
        if (!profileValidation.isValid) {
          throw new ForbiddenException(
            `El usuario no tiene un perfil válido para su rol. Errores: ${profileValidation.errors.join(', ')}`,
          );
        }
      }
    }

    if (requiredPermissions.length > 0) {
      const userPermissions = await this.getUserPermissionsCached(user.id);
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

  private validateUserStatus(user: any): void {
    if (user.isDelete === true) {
      throw new UnauthorizedException('Usuario eliminado');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Usuario inactivo');
    }
  }

  private async getUserRoleCached(userId: string): Promise<string | null> {
    const cacheKey = `${this.ROLE_CACHE_PREFIX}${userId}`;
    const cached = await this.cacheManager.get<string>(cacheKey);

    if (cached) {
      return cached;
    }

    const role = await this.userService.getUserRole(userId);
    if (role) {
      await this.cacheManager.set(cacheKey, role, this.CACHE_TTL);
    }
    return role;
  }

  private async getUserPermissionsCached(userId: string): Promise<string[]> {
    const cacheKey = `${this.PERMISSIONS_CACHE_PREFIX}${userId}`;
    const cached = await this.cacheManager.get<string[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const permissions = await this.permissionsService.getUserPermissions(userId);
    await this.cacheManager.set(cacheKey, permissions, this.CACHE_TTL);
    return permissions;
  }
}
