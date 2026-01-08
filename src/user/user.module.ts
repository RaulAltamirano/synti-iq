import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DatabaseModule } from 'src/database/database.module';
import { PasswordModule } from 'src/auth/services/password/password.module';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'src/shared/redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserProfileModule } from 'src/user_profile/user_profile.module';
import { RoleModule } from 'src/role/role.module';
import { Location } from 'src/location/entities/location.entity';
import { UserProfile } from 'src/user_profile/entities/user_profile.entity';
import { Role } from 'src/role/entities/role.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    UserProfileModule,
    RoleModule,
    CacheModule.register(),
    RedisModule,
    PasswordModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User, Location, UserProfile, Role]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
