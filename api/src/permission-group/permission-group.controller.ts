import { Controller, Get, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PermissionGroupService } from './permission-group.service';
import { UpdatePermissionGroupDto } from './dto/update-permission-group.dto';
import { Auth } from 'src/auth/decorator';

@Controller('permission-groups')
export class PermissionGroupController {
  constructor(private readonly permissionGroupService: PermissionGroupService) {}

  @Get()
  @Auth('admin', ['manage_users'])
  async findAll() {
    return this.permissionGroupService.findAll();
  }

  @Get(':id')
  @Auth('admin', ['manage_users'])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionGroupService.findOne(id);
  }

  @Patch(':id')
  @Auth('admin', ['manage_users'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionGroupDto: UpdatePermissionGroupDto,
  ) {
    return this.permissionGroupService.update(id, updatePermissionGroupDto);
  }
}
