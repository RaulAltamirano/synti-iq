import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DatabaseService } from 'src/database/database.service';
import { PasswordService } from 'src/auth/services/password/password.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import type { ProfileCreationContext } from 'src/user-profile/interfaces/profile-creation-context.interface';
import { Role } from 'src/role/entities/role.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';

@Injectable()
export class UserCreationService {
  private readonly logger = new Logger(UserCreationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
    private readonly userProfileService: UserProfileService,
    private readonly passwordService: PasswordService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy?: string): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const role = await this.validateCreateUserPrerequisites(createUserDto);
      const user = await this.createUserEntity(createUserDto, role.id, createdBy, queryRunner);
      if (!user) throw new InternalServerErrorException('User creation failed');

      const profileCreationContext: ProfileCreationContext | undefined =
        createUserDto.role === SystemRole.CASHIER && createUserDto.actingBusinessProfileId
          ? { actingBusinessProfileId: createUserDto.actingBusinessProfileId }
          : undefined;

      const userProfile = await this.userProfileService.createProfileForUser(
        user.id,
        createUserDto.role,
        createUserDto.profileData,
        queryRunner,
        profileCreationContext,
      );

      await this.validateUserProfileAfterCreation(
        user.id,
        createUserDto.role,
        userProfile,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return this.sanitizeUser(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      this.databaseService.handlerDBexceptions(error);
      this.logger.error(
        `Error creating user: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private assertCreateUserPasswordRules(dto: CreateUserDto): void {
    if (dto.pendingPasswordSetup) {
      if (dto.role !== SystemRole.CASHIER) {
        throw new BadRequestException('pendingPasswordSetup is only allowed for CASHIER role');
      }
      if (dto.password) {
        throw new BadRequestException(
          'password must not be provided when pendingPasswordSetup is true',
        );
      }
    } else if (!dto.password) {
      throw new BadRequestException('password is required');
    }
  }

  private async validateCreateUserPrerequisites(createUserDto: CreateUserDto): Promise<Role> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) throw new ConflictException('User already exists');

    this.assertCreateUserPasswordRules(createUserDto);

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

    if (createUserDto.role === SystemRole.CASHIER && !createUserDto.actingBusinessProfileId) {
      throw new BadRequestException(
        'actingBusinessProfileId is required when creating a cashier user',
      );
    }

    return role;
  }

  private async validateUserProfileAfterCreation(
    userId: string,
    expectedRole: SystemRole,
    userProfile: UserProfile,
    queryRunner: QueryRunner,
  ): Promise<void> {
    if (userProfile.profileType !== expectedRole) {
      throw new BadRequestException(
        `Profile type ${userProfile.profileType} does not match role ${expectedRole}`,
      );
    }

    const validation = await this.userProfileService.validateProfileCoherence(userId, queryRunner);
    if (!validation.isValid) {
      this.logger.error(
        `Profile coherence validation failed after user creation for user ${userId}: ${validation.errors.join(', ')}`,
      );
      throw new BadRequestException(
        `Profile coherence validation failed: ${validation.errors.join(', ')}`,
      );
    }

    const userWithRole = await queryRunner.manager.findOne(User, {
      where: { id: userId },
      relations: ['role'],
    });
    if (userWithRole && userWithRole.role.name !== userProfile.profileType) {
      throw new BadRequestException(
        `Role name ${userWithRole.role.name} does not match profileType ${userProfile.profileType}`,
      );
    }
  }

  private async createUserEntity(
    dto: CreateUserDto,
    roleId: number,
    _createdBy: string | undefined,
    queryRunner: QueryRunner,
  ): Promise<User | null> {
    try {
      const hashedPassword = dto.pendingPasswordSetup
        ? null
        : await this.passwordService.hash(dto.password!);
      const user = this.userRepository.create({
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId,
        isActive: true,
        createdAt: new Date(),
      });

      const savedUser = await queryRunner.manager.save(user);
      return savedUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to create user', {
        method: 'createUserEntity',
        email: dto.email,
        error: message,
      });

      return null;
    }
  }

  private sanitizeUser(user: User): User {
    delete user.password;

    delete user.twoFactorSecret;
    return user;
  }
}
