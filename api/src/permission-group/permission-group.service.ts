import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePermissionGroupDto } from './dto/update-permission-group.dto';
import { PermissionGroup } from './entities/permission-group.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class PermissionGroupService {
  constructor(
    @InjectRepository(PermissionGroup)
    private readonly permissionGroupRepository: Repository<PermissionGroup>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<PermissionGroup[]> {
    return this.permissionGroupRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: number): Promise<PermissionGroup> {
    const permissionGroup = await this.permissionGroupRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!permissionGroup) {
      throw new NotFoundException(`Permission group with ID ${id} not found`);
    }

    return permissionGroup;
  }

  async update(
    id: number,
    updatePermissionGroupDto: UpdatePermissionGroupDto,
  ): Promise<PermissionGroup> {
    const permissionGroup = await this.findOne(id);

    if (updatePermissionGroupDto.name && updatePermissionGroupDto.name !== permissionGroup.name) {
      const existingGroup = await this.permissionGroupRepository.findOne({
        where: { name: updatePermissionGroupDto.name },
      });

      if (existingGroup) {
        throw new ConflictException(
          `Permission group with name '${updatePermissionGroupDto.name}' already exists`,
        );
      }
      permissionGroup.name = updatePermissionGroupDto.name;
    }

    if (updatePermissionGroupDto.description !== undefined) {
      permissionGroup.description = updatePermissionGroupDto.description;
    }

    if (updatePermissionGroupDto.permissionIds !== undefined) {
      if (updatePermissionGroupDto.permissionIds.length > 0) {
        const permissions = await this.validatePermissions(updatePermissionGroupDto.permissionIds);
        permissionGroup.permissions = permissions;
      } else {
        permissionGroup.permissions = [];
      }
    }

    return this.permissionGroupRepository.save(permissionGroup);
  }

  private async validatePermissions(permissionIds: number[]): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      where: permissionIds.map(id => ({ id })),
    });

    if (permissions.length !== permissionIds.length) {
      const foundIds = permissions.map(p => p.id);
      const missingIds = permissionIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Permissions with IDs [${missingIds.join(', ')}] not found`);
    }

    return permissions;
  }
}
