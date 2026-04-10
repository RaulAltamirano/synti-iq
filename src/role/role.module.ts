import { Module, forwardRef } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { User } from 'src/user/entities/user.entity';
import { GuardsModule } from 'src/auth/guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, PermissionGroup, User]),
    forwardRef(() => GuardsModule),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
