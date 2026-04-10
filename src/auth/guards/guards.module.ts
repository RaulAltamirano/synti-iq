import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RolesPermissionsGuard } from './user-role.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [CacheModule.register(), forwardRef(() => UserModule)],
  providers: [RolesPermissionsGuard],
  exports: [RolesPermissionsGuard],
})
export class GuardsModule {}
