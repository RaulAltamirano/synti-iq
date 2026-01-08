import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Permission } from 'src/permission/entities/permission.entity';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { UserProfile } from 'src/user_profile/entities/user_profile.entity';
import { PermissionsSeed } from './permissions.seed';
import { PermissionGroupsSeed } from './permission-groups.seed';
import { RolesSeed } from './roles.seed';
import { UsersSeed } from './users.seed';
import { PasswordModule } from 'src/auth/services/password/password.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const seedsDatabaseConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [Permission, PermissionGroup, Role, User, UserProfile],
  autoLoadEntities: false,
  synchronize: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: seedsDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Permission, PermissionGroup, Role, User, UserProfile]),
    PasswordModule,
  ],
  providers: [PermissionsSeed, PermissionGroupsSeed, RolesSeed, UsersSeed],
  exports: [PermissionsSeed, PermissionGroupsSeed, RolesSeed, UsersSeed],
})
export class SeedsStandaloneModule {}
