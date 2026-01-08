import { Controller, Get, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from 'src/auth/decorator';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Auth('admin', ['manage_users'])
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Auth('admin', ['manage_users'])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @Auth('admin', ['manage_users'])
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }
}
