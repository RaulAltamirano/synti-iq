import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
