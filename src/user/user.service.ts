import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, FindOneOptions, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { Cache } from 'cache-manager';

import { User } from './entities/user.entity';
import { DatabaseService } from 'src/database/database.service';
import { PasswordService } from 'src/auth/services/password/password.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { createHash } from 'crypto';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UserProfileService } from 'src/user_profile/user_profile.service';
import { Role } from 'src/role/entities/role.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  private readonly CACHE_TTL = 1800;
  private readonly CACHE_PREFIX = 'users:filter:';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private databaseService: DatabaseService,
    private passwordService: PasswordService,
    private readonly dataSource: DataSource,
    private readonly userProfileService: UserProfileService,
    private readonly redisService: RedisService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private buildCacheKey(filters: FilterUserDto): string {
    const orderedFilters = Object.keys(filters)
      .sort()
      .reduce((obj, key) => {
        obj[key] = filters[key];
        return obj;
      }, {});

    return `${this.CACHE_PREFIX}${createHash('sha256')
      .update(JSON.stringify(orderedFilters))
      .digest('hex')}`;
  }

  private buildQuery(query: SelectQueryBuilder<User>, filters: FilterUserDto) {
    query
      .leftJoinAndSelect('user.role', 'role')
      .where('user.isDelete = :isDelete', { isDelete: false });

    if (filters.fullName) {
      query.andWhere('LOWER(user.fullName) LIKE LOWER(:fullName)', {
        fullName: `%${this.escapeLikeString(filters.fullName)}%`,
      });
    }

    if (filters.email) {
      query.andWhere('LOWER(user.email) LIKE LOWER(:email)', {
        email: `%${this.escapeLikeString(filters.email)}%`,
      });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isOnline) {
      const onlineThreshold = new Date(Date.now() - 5 * 60 * 1000);
      query.andWhere('user.lastLogin > :onlineThreshold', {
        onlineThreshold,
      });
    }

    if (filters.isPendingApproval) {
      query.andWhere('user.isActive = :isActive', { isActive: false });
    }

    if (filters.roles?.length) {
      query.andWhere('role.name IN (:...roleNames)', {
        roleNames: filters.roles,
      });
    }

    return query;
  }

  private escapeLikeString(value: string): string {
    return value.replace(/[%_\\]/g, '\\$&');
  }

  async filterUsers(filters: FilterUserDto): Promise<PaginatedResponse<User>> {
    try {
      const cacheKey = this.buildCacheKey(filters);
      const cachedData = await this.cacheManager.get<PaginatedResponse<User>>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const query = this.userRepository.createQueryBuilder('user');
      this.buildQuery(query, filters);

      const [users, total] = await query
        .orderBy('user.createdAt', 'DESC')
        .skip((filters.page - 1) * filters.limit)
        .take(filters.limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / filters.limit);
      const response: PaginatedResponse<User> = {
        data: users,
        total,
        page: filters.page,
        totalPages,
        limit: filters.limit,
        hasNextPage: filters.page < totalPages,
        hasPreviousPage: filters.page > 1,
      };

      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);

      return response;
    } catch (error) {
      throw new Error(`Error filtering users: ${error.message}`);
    }
  }

  async create(createUserDto: CreateUserDto, createdBy?: string): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) throw new ConflictException('User already exists');

      const role = await this.roleRepository.findOne({
        where: { name: createUserDto.role },
      });

      if (!role) {
        throw new BadRequestException(`Role '${createUserDto.role}' not found`);
      }

      const requiresProfileData = [
        SystemRole.CASHIER,
        SystemRole.DELIVERY,
        SystemRole.PROVIDER,
      ].includes(createUserDto.role);

      if (requiresProfileData && !createUserDto.profileData) {
        throw new BadRequestException(`profileData is required for role: ${createUserDto.role}`);
      }

      const user = await this.createUserEntity(createUserDto, role.id, createdBy, queryRunner);

      if (!user) throw new InternalServerErrorException('User creation failed');

      const userProfile = await this.userProfileService.createProfileForUser(
        user.id,
        createUserDto.role,
        createUserDto.profileData,
        queryRunner,
      );

      // Validar coherencia: profileType debe coincidir con role.name
      if (userProfile && userProfile.profileType !== createUserDto.role) {
        throw new BadRequestException(
          `Profile type ${userProfile.profileType} does not match role ${createUserDto.role}`,
        );
      }

      // Validar coherencia completa después de crear UserProfile
      const validation = await this.userProfileService.validateProfileCoherence(user.id);
      if (!validation.isValid) {
        this.logger.error(
          `Profile coherence validation failed after user creation for user ${user.id}: ${validation.errors.join(', ')}`,
        );
        throw new BadRequestException(
          `Profile coherence validation failed: ${validation.errors.join(', ')}`,
        );
      }

      // Validar que role.name coincide con profileType antes de commit
      const userWithRole = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
        relations: ['role'],
      });

      if (userWithRole && userProfile) {
        if (userWithRole.role.name !== userProfile.profileType) {
          throw new BadRequestException(
            `Role name ${userWithRole.role.name} does not match profileType ${userProfile.profileType}`,
          );
        }
      }

      await queryRunner.commitTransaction();

      return this.sanitizeUser(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.databaseService.handlerDBexceptions(error);
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createUserEntity(
    dto: CreateUserDto,
    roleId: number,
    createdBy: string | undefined,
    queryRunner: QueryRunner,
  ): Promise<User | null> {
    try {
      const hashedPassword = await this.passwordService.hash(dto.password);
      const user = this.userRepository.create({
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        roleId,
        isActive: true,
        approvedBy: createdBy ?? null,
        createdAt: new Date(),
      });

      const savedUser = await queryRunner.manager.save(user);

      this.logger.debug('User created successfully', { userId: savedUser.id });

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to create user', {
        method: 'createUserEntity',
        email: dto.email,
        error: error.message,
      });

      return null;
    }
  }

  private sanitizeUser(user: User): User {
    delete user.password;

    delete user.twoFactorSecret;
    return user;
  }

  async updatePassword(email: string, password: string) {
    this.logger.log('Run update password');
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

    if (!user) {
      user = await this.userRepository.findOne({
        where: { id, isDelete: false },
        relations: ['role', 'profile'],
      });
      if (!user) throw new NotFoundException('User not found');
      await this.redisService.set(cacheKey, user, 3600);
    } else {
      if (user.isDelete) {
        await this.redisService.del(cacheKey);
        throw new NotFoundException('User not found');
      }
      const dbUser = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'isDelete'],
      });
      if (dbUser?.isDelete) {
        await this.redisService.del(cacheKey);
        throw new NotFoundException('User not found');
      }
    }

    return user;
  }

  async getMyProfile(userId: string): Promise<any> {
    const user = await this.findById(userId);

    if (!user.isActive) {
      throw new NotFoundException('User account is inactive');
    }

    const userProfile = await this.userProfileService.getUserProfile(userId);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      isActive: user.isActive,
      isApproved: user.isApproved,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      lastActivityAt: user.lastActivityAt,
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
      includeRole?: boolean;
    } = {},
  ): Promise<User | null> {
    const { selectPassword = false, includeRole = true } = options;

    const queryOptions: FindOneOptions<User> = {
      where: { email, isDelete: false },
    };
    if (selectPassword) queryOptions.select = ['id', 'email', 'password', 'isActive', 'isDelete'];

    if (includeRole) {
      queryOptions.relations = ['role'];
    }

    return this.userRepository.findOne(queryOptions);
  }

  async getUserRole(userId: string): Promise<SystemRole | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user || !user.role) {
      return null;
    }

    return user.role.name;
  }

  async assignRole(userId: string, roleId: number, profileData?: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['role', 'profile'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.isActive || user.isDelete) {
        throw new BadRequestException(`User ${userId} is not active`);
      }

      const newRole = await this.roleRepository.findOne({
        where: { id: roleId },
      });

      if (!newRole) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      const newRoleName = newRole.name;

      // Validar que se proporcione profileData si el rol lo requiere
      const requiresProfileData = [
        SystemRole.CASHIER,
        SystemRole.DELIVERY,
        SystemRole.PROVIDER,
      ].includes(newRoleName);

      if (requiresProfileData && !profileData) {
        throw new BadRequestException(`profileData is required for role: ${newRoleName}`);
      }

      // Si el usuario ya tiene un perfil con profileId, eliminarlo
      if (user.profile) {
        const hasSpecificProfile = [
          SystemRole.CASHIER,
          SystemRole.DELIVERY,
          SystemRole.PROVIDER,
        ].includes(user.profile.profileType);

        if (hasSpecificProfile && user.profile.profileId) {
          await this.userProfileService.deleteProfile(userId, queryRunner);
        }
      }

      // Actualizar el rol del usuario
      user.roleId = roleId;
      await queryRunner.manager.save(user);

      // Crear o actualizar el UserProfile correspondiente
      await this.userProfileService.createProfileForUser(
        userId,
        newRoleName,
        profileData,
        queryRunner,
      );

      // Validar coherencia después de asignar el rol
      const validation = await this.userProfileService.validateProfileCoherence(userId);
      if (!validation.isValid) {
        this.logger.error(
          `Profile coherence validation failed after role assignment for user ${userId}: ${validation.errors.join(', ')}`,
        );
        throw new BadRequestException(
          `Profile coherence validation failed: ${validation.errors.join(', ')}`,
        );
      }

      await queryRunner.commitTransaction();
      await this.cacheManager.del(`user:role:${userId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRole(userId: string, roleId: number, profileData?: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['role', 'profile'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.isActive || user.isDelete) {
        throw new BadRequestException(`User ${userId} is not active`);
      }

      const newRole = await this.roleRepository.findOne({
        where: { id: roleId },
      });

      if (!newRole) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      const currentRole = user.role?.name;
      const newRoleName = newRole.name;

      if (currentRole === newRoleName) {
        return;
      }

      const requiresProfileData = [
        SystemRole.CASHIER,
        SystemRole.DELIVERY,
        SystemRole.PROVIDER,
      ].includes(newRoleName);

      if (requiresProfileData && !profileData) {
        throw new BadRequestException(`profileData is required for role: ${newRoleName}`);
      }

      if (user.profile) {
        const hasSpecificProfile = [
          SystemRole.CASHIER,
          SystemRole.DELIVERY,
          SystemRole.PROVIDER,
        ].includes(user.profile.profileType);

        if (hasSpecificProfile && user.profile.profileId) {
          await this.userProfileService.deleteProfile(userId, queryRunner);
        }
      }

      user.roleId = roleId;
      await queryRunner.manager.save(user);

      await this.userProfileService.createProfileForUser(
        userId,
        newRoleName,
        profileData,
        queryRunner,
      );

      // Validar coherencia después de actualizar el rol
      const validation = await this.userProfileService.validateProfileCoherence(userId);
      if (!validation.isValid) {
        this.logger.error(
          `Profile coherence validation failed after role update for user ${userId}: ${validation.errors.join(', ')}`,
        );
        throw new BadRequestException(
          `Profile coherence validation failed: ${validation.errors.join(', ')}`,
        );
      }

      await queryRunner.commitTransaction();
      await this.cacheManager.del(`user:role:${userId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLogin: new Date() });
    await this.redisService.del(`user:${userId}`);
  }
}
