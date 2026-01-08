import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { User } from 'src/user/entities/user.entity';
import { PermissionController } from './permission.controller';
import { GuardsModule } from 'src/auth/guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, PermissionGroup, User]),
    forwardRef(() => GuardsModule),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
