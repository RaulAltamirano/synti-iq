import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DatabaseModule } from 'src/database/database.module';
import { PasswordModule } from 'src/auth/services/password/password.module';
// import { AuthModule } from 'src/auth/services/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    // AuthModule,
    PasswordModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
