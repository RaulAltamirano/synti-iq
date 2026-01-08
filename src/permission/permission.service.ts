import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const permissions = await this.findPermissionsByUserId(userId);
    return permissions.map(permission => permission.name);
  }

  async findPermissionsByUserId(userId: string): Promise<Permission[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissionGroups', 'role.permissionGroups.permissions'],
    });

    if (!user || !user.role) {
      return [];
    }

    const permissions: Permission[] = [];
    const permissionMap = new Map<number, Permission>();

    if (user.role.permissionGroups) {
      for (const group of user.role.permissionGroups) {
        if (group.permissions) {
          for (const permission of group.permissions) {
            if (!permissionMap.has(permission.id)) {
              permissionMap.set(permission.id, permission);
              permissions.push(permission);
            }
          }
        }
      }
    }

    return permissions;
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
