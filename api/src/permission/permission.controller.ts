import { Controller, Get, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Auth } from 'src/auth/decorator';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Auth('admin', ['manage_users'])
  async findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @Auth('admin', ['manage_users'])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @Auth('admin', ['manage_users'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }
}
