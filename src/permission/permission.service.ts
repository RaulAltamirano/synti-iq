import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Permission } from './entities/permission.entity';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { User } from 'src/user/entities/user.entity';
import {
  USER_PERMISSIONS_CACHE_PREFIX,
  USER_PERMISSIONS_CACHE_TTL_MS,
} from 'src/permission/constants';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const key = `${USER_PERMISSIONS_CACHE_PREFIX}${userId}`;
    const cached = await this.cacheManager.get<string[]>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }
    const permissions = await this.findPermissionsByUserId(userId);
    const names = permissions.map(permission => permission.name);
    await this.cacheManager.set(key, names, USER_PERMISSIONS_CACHE_TTL_MS);
    return names;
  }

  async invalidateUserPermissionsCache(userId: string): Promise<void> {
    await this.cacheManager.del(`${USER_PERMISSIONS_CACHE_PREFIX}${userId}`);
  }

  async invalidateUserPermissionsCacheForRoleId(roleId: number): Promise<void> {
    const users = await this.userRepository.find({
      where: { roleId },
      select: ['id'],
    });
    await Promise.all(users.map(u => this.invalidateUserPermissionsCache(u.id)));
  }

  private collectPermissionsFromGroups(
    permissionGroups: { permissions?: Permission[] }[],
  ): Permission[] {
    const permissions: Permission[] = [];
    const seen = new Set<number>();
    for (const group of permissionGroups) {
      if (!group?.permissions) continue;
      for (const p of group.permissions) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          permissions.push(p);
        }
      }
    }
    return permissions;
  }

  async findPermissionsByUserId(userId: string): Promise<Permission[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissionGroups', 'role.permissionGroups.permissions'],
    });
    if (!user?.role?.permissionGroups) return [];
    return this.collectPermissionsFromGroups(user.role.permissionGroups);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      relations: ['groups'],
    });
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['groups'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updatePermissionDto.name },
      });

      if (existingPermission) {
        throw new ConflictException(
          `Permission with name '${updatePermissionDto.name}' already exists`,
        );
      }
      permission.name = updatePermissionDto.name;
    }

    if (updatePermissionDto.description !== undefined) {
      permission.description = updatePermissionDto.description;
    }

    return this.permissionRepository.save(permission);
  }
}
