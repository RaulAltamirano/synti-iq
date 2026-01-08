import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PermissionGroup)
    private readonly permissionGroupRepository: Repository<PermissionGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findRoleByUserId(userId: string): Promise<Role | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    return user?.role || null;
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissionGroups'],
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissionGroups'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`);
      }
      role.name = updateRoleDto.name;
    }

    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }

    if (updateRoleDto.permissionGroupIds !== undefined) {
      if (updateRoleDto.permissionGroupIds.length > 0) {
        const permissionGroups = await this.validatePermissionGroups(
          updateRoleDto.permissionGroupIds,
        );
        role.permissionGroups = permissionGroups;
      } else {
        role.permissionGroups = [];
      }
    }

    return (await this.roleRepository.save(role)) as Role;
  }

  private async validatePermissionGroups(groupIds: number[]): Promise<PermissionGroup[]> {
    const permissionGroups = await this.permissionGroupRepository.find({
      where: groupIds.map(id => ({ id })),
    });

    if (permissionGroups.length !== groupIds.length) {
      const foundIds = permissionGroups.map(pg => pg.id);
      const missingIds = groupIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(
        `Permission groups with IDs [${missingIds.join(', ')}] not found`,
      );
    }

    return permissionGroups;
  }
}
