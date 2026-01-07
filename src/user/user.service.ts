import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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
import { UserPaginatedResponse } from './interfaces/user-paginated-response.graphql';
import { createHash } from 'crypto';
import { CreateUserDto } from './dtos/CreateUserDto';

import { UserProfileService } from 'src/user_profile/user_profile.service';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  private readonly CACHE_TTL = 1800;
  private readonly CACHE_PREFIX = 'users:filter:';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      .leftJoinAndSelect('user.roles', 'roles')
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
      query.andWhere('roles.name IN (:...roleNames)', {
        roleNames: filters.roles,
      });
    }

    return query;
  }

  private escapeLikeString(value: string): string {
    return value.replace(/[%_\\]/g, '\\$&');
  }

  async filterUsers(filters: FilterUserDto): Promise<UserPaginatedResponse> {
    try {
      const cacheKey = this.buildCacheKey(filters);
      const cachedData = await this.cacheManager.get<UserPaginatedResponse>(cacheKey);

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

      const response: UserPaginatedResponse = {
        data: users,
        total,
        page: filters.page,
        totalPages: Math.ceil(total / filters.limit),
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

      const user = await this.createUserEntity(createUserDto, createdBy, queryRunner);

      if (!user) throw new InternalServerErrorException('User creation failed');

      await this.userProfileService.createUserProfile(createUserDto, user.id, queryRunner);

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
    createdBy: string | undefined,
    queryRunner: QueryRunner,
  ): Promise<User | null> {
    try {
      const hashedPassword = await this.passwordService.hash(dto.password);
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
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
        relations: ['roles'],
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

  async findByEmail(
    email: string,
    options: {
      selectPassword?: boolean;
      includeRoles?: boolean;
    } = {},
  ): Promise<User | null> {
    const { selectPassword = false, includeRoles = true } = options;

    const queryOptions: FindOneOptions<User> = {
      where: { email, isDelete: false },
    };
    if (selectPassword) queryOptions.select = ['id', 'email', 'password', 'isActive', 'isDelete'];

    if (includeRoles) {
      queryOptions.relations = ['roles'];
    }

    return this.userRepository.findOne(queryOptions);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLogin: new Date() });
    await this.redisService.del(`user:${userId}`);
  }
}
