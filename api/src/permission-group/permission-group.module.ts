import { Module, forwardRef } from '@nestjs/common';
import { PermissionGroupService } from './permission-group.service';
import { PermissionGroupController } from './permission-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionGroup } from './entities/permission-group.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { GuardsModule } from 'src/auth/guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionGroup, Permission, Role]),
    forwardRef(() => GuardsModule),
  ],
  controllers: [PermissionGroupController],
  providers: [PermissionGroupService],
  exports: [PermissionGroupService],
})
export class PermissionGroupModule {}
