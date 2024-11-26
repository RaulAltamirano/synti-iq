import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { DatabaseService } from 'src/database/database.service';
import { SignupUserDto } from 'src/auth/dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private databaseService: DatabaseService,
  ) {}
  async saveRefreshToken(id: string, refreshToken: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.refreshToken = refreshToken;
      await this.userRepository.save(user);
    }
  }
  async create(signupUserDto: SignupUserDto): Promise<User> {
    const { password, ...restObj } = signupUserDto;
    try {
      const user = this.userRepository.create({
        ...restObj,
        password: this.hash(password),
      });
      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.databaseService.handlerDBexceptions(error);
    }
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

  async comparePassword(data: string, encrypted: string): Promise<boolean> {
    if (!bcrypt.compareSync(data, encrypted)) return false;
  }
  private hash(data: string) {
    return bcrypt.hashSync(data, 10);
  }
  async updateLastlogin(id: string) {
    await this.userRepository.update(id, {
      lastLogin: new Date(),
    });
  }
}
