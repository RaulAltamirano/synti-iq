import { Module } from '@nestjs/common';
import { PermissionGroupService } from './permission-group.service';
import { PermissionGroupController } from './permission-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionGroup } from './entities/permission-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionGroup])],
  controllers: [PermissionGroupController],
  providers: [PermissionGroupService],
})
export class PermissionGroupModule {}
