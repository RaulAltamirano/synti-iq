import { Inject, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from '../entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { Store } from 'src/store/entities/store.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import type { ProfileCreationContext } from 'src/user-profile/interfaces/profile-creation-context.interface';
import { PermissionService } from 'src/permission/permission.service';

const OPERATIONAL_PROFILE_ROLES = new Set<SystemRole>([
  SystemRole.CASHIER,
  SystemRole.DELIVERY,
  SystemRole.PROVIDER,
]);

@Injectable()
export class UserRoleMutationService {
  private readonly logger = new Logger(UserRoleMutationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
    private readonly userProfileService: UserProfileService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Resolves {@link ProfileCreationContext} for cashier profiles from the target store
   * so {@link CashierProfileStrategy} can enforce store.businessProfileId alignment.
   */
  private async buildProfileCreationContextForCashierRole(
    newRoleName: SystemRole,
    profileData: unknown,
    queryRunner: QueryRunner,
  ): Promise<ProfileCreationContext | undefined> {
    if (newRoleName !== SystemRole.CASHIER) {
      return undefined;
    }
    const pd = profileData as { storeId?: string };
    if (!pd?.storeId) {
      throw new BadRequestException('profileData.storeId is required for cashier role');
    }
    const store = await queryRunner.manager.findOne(Store, {
      where: { id: pd.storeId },
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${pd.storeId} not found`);
    }
    return { actingBusinessProfileId: store.businessProfileId };
  }

  private async findActiveUserWithProfileOrThrow(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'profile'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (!user.isActive || user.deletedAt) {
      throw new BadRequestException(`User ${userId} is not active`);
    }
    return user;
  }

  private async findRoleByIdOrThrow(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return role;
  }

  private assertProfileDataWhenRequired(
    newRoleName: SystemRole,
    profileData: Record<string, unknown> | undefined,
  ): void {
    const requiresProfileData = OPERATIONAL_PROFILE_ROLES.has(newRoleName);
    if (requiresProfileData && !profileData) {
      throw new BadRequestException(`profileData is required for role: ${newRoleName}`);
    }
  }

  private async deleteSpecificProfileIfNeeded(
    user: User,
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    if (!user.profile) return;
    const hasSpecificProfile = OPERATIONAL_PROFILE_ROLES.has(user.profile.profileType);
    if (hasSpecificProfile && user.profile.profileId) {
      await this.userProfileService.deleteProfile(userId, queryRunner);
    }
  }

  private async applyRoleAndProfile(
    user: User,
    userId: string,
    roleId: number,
    newRoleName: SystemRole,
    profileData: Record<string, unknown> | undefined,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const profileCreationContext = await this.buildProfileCreationContextForCashierRole(
      newRoleName,
      profileData,
      queryRunner,
    );
    await this.deleteSpecificProfileIfNeeded(user, userId, queryRunner);
    user.roleId = roleId;
    await queryRunner.manager.save(user);
    const mergedProfileData =
      profileCreationContext?.actingBusinessProfileId !== undefined
        ? {
            ...(profileData ?? {}),
            actingBusinessProfileId: profileCreationContext.actingBusinessProfileId,
          }
        : profileData;

    await this.userProfileService.createProfileForUser(
      userId,
      newRoleName,
      mergedProfileData,
      queryRunner,
    );
  }

  private async assertProfileCoherenceAfterAssign(userId: string): Promise<void> {
    const validation = await this.userProfileService.validateProfileCoherence(userId);
    if (!validation.isValid) {
      this.logger.error(
        `Profile coherence validation failed after role assignment for user ${userId}: ${validation.errors.join(', ')}`,
      );
      throw new BadRequestException(
        `Profile coherence validation failed: ${validation.errors.join(', ')}`,
      );
    }
  }

  private async assertProfileCoherenceAfterUpdate(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const validation = await this.userProfileService.validateProfileCoherence(userId, queryRunner);
    if (!validation.isValid) {
      this.logger.error(
        `Profile coherence validation failed after role update for user ${userId}: ${validation.errors.join(', ')}`,
      );
      throw new BadRequestException(
        `Profile coherence validation failed: ${validation.errors.join(', ')}`,
      );
    }
  }

  private async invalidateUserRoleCaches(userId: string): Promise<void> {
    await this.cacheManager.del(`user:role:${userId}`);
    await this.permissionService.invalidateUserPermissionsCache(userId);
  }

  async assignRole(
    userId: string,
    roleId: number,
    profileData?: Record<string, unknown>,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findActiveUserWithProfileOrThrow(userId);
      const newRole = await this.findRoleByIdOrThrow(roleId);
      const newRoleName = newRole.name as SystemRole;

      this.assertProfileDataWhenRequired(newRoleName, profileData);

      await this.applyRoleAndProfile(user, userId, roleId, newRoleName, profileData, queryRunner);
      await this.assertProfileCoherenceAfterAssign(userId);

      await queryRunner.commitTransaction();
      await this.invalidateUserRoleCaches(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRole(
    userId: string,
    roleId: number,
    profileData?: Record<string, unknown>,
  ): Promise<void> {
    const user = await this.findActiveUserWithProfileOrThrow(userId);
    const newRole = await this.findRoleByIdOrThrow(roleId);
    const newRoleName = newRole.name as SystemRole;

    if (user.role?.name === newRoleName) {
      return;
    }

    this.assertProfileDataWhenRequired(newRoleName, profileData);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.applyRoleAndProfile(user, userId, roleId, newRoleName, profileData, queryRunner);
      await this.assertProfileCoherenceAfterUpdate(userId, queryRunner);

      await queryRunner.commitTransaction();
      await this.invalidateUserRoleCaches(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
