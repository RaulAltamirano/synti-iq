import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOneOptions, IsNull, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { FilterBusinessUsersDto } from './dto/filter-business-users.dto';
import { RoleService } from 'src/role/role.service';
import { UserFiltersService } from './services/user-filters.service';
import { UserCreationService } from './services/user-creation.service';
import { UserRoleMutationService } from './services/user-role-mutation.service';
import type { UserProfileResponse } from './interfaces/user-profile-response.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userProfileService: UserProfileService,
    private readonly redisService: RedisService,
    private readonly roleService: RoleService,
    private readonly userFiltersService: UserFiltersService,
    private readonly userCreationService: UserCreationService,
    private readonly userRoleMutationService: UserRoleMutationService,
  ) {}

  async filterUsers(filters: FilterUserDto): Promise<PaginatedResponse<User>> {
    return this.userFiltersService.filterUsers(filters);
  }

  async filterUsersByBusiness(
    filters: FilterBusinessUsersDto,
    userId: string,
  ): Promise<PaginatedResponse<User>> {
    return this.userFiltersService.filterUsersByBusiness(filters, userId);
  }

  async create(createUserDto: CreateUserDto, createdBy?: string): Promise<User> {
    return this.userCreationService.create(createUserDto, createdBy);
  }

  async updatePassword(_email: string, _password: string) {
    // TODO: implement password update logic
  }

  async validateUser(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    return user;
  }

  async findById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    let user = await this.redisService.get<User>(cacheKey);

    if (user) {
      if (user.deletedAt) {
        await this.redisService.del(cacheKey);
        throw new NotFoundException('User not found');
      }
      const dbUser = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'deletedAt'],
      });
      if (dbUser?.deletedAt) {
        await this.redisService.del(cacheKey);
        throw new NotFoundException('User not found');
      }
    } else {
      user = await this.userRepository.findOne({
        where: { id, deletedAt: IsNull() },
        relations: ['role', 'profile'],
      });
      if (!user) throw new NotFoundException('User not found');
      await this.redisService.set(cacheKey, user, 3600);
    }

    return user;
  }

  async getMyProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.findById(userId);

    if (!user.isActive) {
      throw new NotFoundException('User account is inactive');
    }

    const userProfile = await this.userProfileService.getUserProfile(userId);
    const approvalStatus = await this.userProfileService.getApprovalStatus(userId, user.role.name);
    const isOnline = await this.userProfileService.getOnlineStatus(userId, user.role.name);
    const lastActivityAt = await this.userProfileService.getLastActivityAt(userId, user.role.name);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name,
      isActive: user.isActive,
      isApproved: approvalStatus.isApproved,
      approvedAt: approvalStatus.approvedAt,
      approvedBy: approvalStatus.approvedBy,
      isOnline,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      lastActivityAt,
      profile: userProfile
        ? {
            id: userProfile.id,
            profileType: userProfile.profileType,
            profileId: userProfile.profileId,
            metadata: userProfile.metadata,
            createdAt: userProfile.createdAt,
            updatedAt: userProfile.updatedAt,
          }
        : null,
    };
  }

  async findByEmail(
    email: string,
    options: {
      selectPassword?: boolean;
      selectTwoFactorSecret?: boolean;
      includeRole?: boolean;
    } = {},
  ): Promise<User | null> {
    const { selectPassword = false, selectTwoFactorSecret = false, includeRole = true } = options;

    const queryOptions: FindOneOptions<User> = {
      where: { email, deletedAt: IsNull() },
    };
    if (selectPassword || selectTwoFactorSecret) {
      queryOptions.select = ['id', 'email', 'isActive', 'deletedAt'];
      if (selectPassword) queryOptions.select.push('password');
      if (selectTwoFactorSecret) queryOptions.select.push('twoFactorSecret');
    }

    if (includeRole) {
      queryOptions.relations = ['role'];
    }

    return this.userRepository.findOne(queryOptions);
  }

  async getUserRole(userId: string): Promise<SystemRole | null> {
    const role = await this.roleService.findRoleByUserId(userId);
    return role?.name ?? null;
  }

  async assignRole(
    userId: string,
    roleId: number,
    profileData?: Record<string, unknown>,
  ): Promise<void> {
    return this.userRoleMutationService.assignRole(userId, roleId, profileData);
  }

  async updateRole(
    userId: string,
    roleId: number,
    profileData?: Record<string, unknown>,
  ): Promise<void> {
    return this.userRoleMutationService.updateRole(userId, roleId, profileData);
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) return;

    const now = new Date();
    user.lastLogin = now;
    await this.userRepository.save(user);

    await this.userProfileService.updateLastActivity(userId, user.role.name);
    await this.redisService.del(`user:${userId}`);
  }

  async updateLastActivity(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) return;

    await this.userProfileService.updateLastActivity(userId, user.role.name);
    await this.redisService.del(`user:${userId}`);
  }
}
