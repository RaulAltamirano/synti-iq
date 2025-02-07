import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PermissionGroupService } from './permission-group.service';
import { CreatePermissionGroupDto } from './dto/create-permission-group.dto';
import { UpdatePermissionGroupDto } from './dto/update-permission-group.dto';

@Controller('permission-group')
export class PermissionGroupController {
  constructor(private readonly permissionGroupService: PermissionGroupService) {}

  @Post()
  create(@Body() createPermissionGroupDto: CreatePermissionGroupDto) {
    return this.permissionGroupService.create(createPermissionGroupDto);
  }

  @Get()
  findAll() {
    return this.permissionGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionGroupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionGroupDto: UpdatePermissionGroupDto) {
    return this.permissionGroupService.update(+id, updatePermissionGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionGroupService.remove(+id);
  }
}
