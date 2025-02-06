import { Injectable } from '@nestjs/common';
import { CreatePermissionGroupDto } from './dto/create-permission-group.dto';
import { UpdatePermissionGroupDto } from './dto/update-permission-group.dto';

@Injectable()
export class PermissionGroupService {
  create(createPermissionGroupDto: CreatePermissionGroupDto) {
    return 'This action adds a new permissionGroup';
  }

  findAll() {
    return `This action returns all permissionGroup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permissionGroup`;
  }

  update(id: number, updatePermissionGroupDto: UpdatePermissionGroupDto) {
    return `This action updates a #${id} permissionGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} permissionGroup`;
  }
}
