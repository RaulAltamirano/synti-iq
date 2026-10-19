import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserFiltersService } from './services/user-filters.service';
import { UserCreationService } from './services/user-creation.service';
import { UserRoleMutationService } from './services/user-role-mutation.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DatabaseModule } from 'src/database/database.module';
import { PasswordModule } from 'src/auth/services/password/password.module';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'src/shared/redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserProfileModule } from 'src/user-profile/user_profile.module';
import { RoleModule } from 'src/role/role.module';
import { Location } from 'src/location/entities/location.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { Role } from 'src/role/entities/role.entity';
import { Store } from 'src/store/entities/store.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { GuardsModule } from 'src/auth/guards/guards.module';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  controllers: [UserController],
  providers: [UserFiltersService, UserCreationService, UserRoleMutationService, UserService],
  imports: [
    GuardsModule,
    PermissionModule,
    UserProfileModule,
    RoleModule,
    CacheModule.register(),
    RedisModule,
    PasswordModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User, Location, UserProfile, Role, Store, CashierProfile]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
