import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { DatabaseService } from 'src/database/database.service';
import { SignupUserDto } from 'src/auth/dto';
import { PasswordService } from 'src/auth/services/password/password.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private databaseService: DatabaseService,
    private passwordService: PasswordService,
  ) {}
  async saveRefreshToken(id: string, refreshToken: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.refreshToken = refreshToken;
      await this.userRepository.save(user);
    }
  }
  async create(signupUserDto: SignupUserDto): Promise<User> {
    this.logger.log('Run creation');
    const { password, ...restObj } = signupUserDto;
    try {
      const hashedPassword = await this.passwordService.hash(password);
      const user = this.userRepository.create({
        ...restObj,
        password: hashedPassword,
      });
      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.databaseService.handlerDBexceptions(error);
    }
  }
  async updatePassword(email: string, password: string) {
    this.logger.log('Run update password');

    // const user = await this.userRepository.findOne({
    //   where: { email },
    //   select: { email: true, password: true, id: true },
    // });
    // return user;
    console.log(email, password);
  }
  async validateUser(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    return user;
  }
  async finById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        refreshToken: true,
        isActive: true,
        fullName: true,
        roles: true,
      },
    });
    return user;
  }
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        id: true,
        // refreshToken: true,
        // fullName: true,
      },
    });
    return user;
  }

  async findByRefreshToken(refreshToken: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { refreshToken },
      select: {
        email: true,
        id: true,
        refreshToken: true,
        fullName: true,
      },
    });
    return user;
  }
  async clearRefreshToken(user: User): Promise<void> {
    const currentUser = await this.finById(user.id);
    currentUser.refreshToken = null;
    await this.userRepository.save(currentUser);
  }

  async updateLastlogin(id: string) {
    await this.userRepository.update(id, {
      lastLogin: new Date(),
    });
  }
}
