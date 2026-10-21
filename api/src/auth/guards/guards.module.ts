import { Module, forwardRef } from '@nestjs/common';
import { RolesPermissionsGuard } from './user-role.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [RolesPermissionsGuard],
  exports: [RolesPermissionsGuard],
})
export class GuardsModule {}
