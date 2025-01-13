import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { RedisModule } from 'src/shared/redis/redis.module';
import { AuthModule } from 'src/auth/services/auth/auth.module';
import { databaseConfig } from 'src/database/database.config';
import { PermissionModule } from 'src/permission/permission.module';
import { RoleModule } from 'src/role/role.module';
import { PermissionGroupModule } from 'src/permission-group/permission-group.module';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { JwtHelperModule } from 'src/shared/jwt-helper/jwt-helper.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PermissionModule,
    RoleModule,
    PermissionGroupModule,
    UserRoleModule,
    DatabaseModule,
    RedisModule,
    // JwtHelperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
