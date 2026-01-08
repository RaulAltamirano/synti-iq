import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { SystemRole, isSystemRole } from 'src/shared/enums/roles.enum';
import { UserProfile } from './entities/user_profile.entity';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery_profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider_profile/entities/provider_profile.entity';
import { CreateCashierProfileDto } from 'src/cashier_profile/dto/create-cashier-profile.dto';
import { CreateDeliveryProfileDto } from 'src/delivery_profiles/dto/create-delivery-profile.dto';
import { CreateProviderProfileDto } from 'src/provider_profile/dto/create-provider-profile.dto';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(CashierProfile)
    private readonly cashierProfileRepository: Repository<CashierProfile>,
    @InjectRepository(DeliveryProfile)
    private readonly deliveryProfileRepository: Repository<DeliveryProfile>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  private async createProfileFactory(
    role: SystemRole,
    data:
      | CreateCashierProfileDto
      | CreateDeliveryProfileDto
      | CreateProviderProfileDto
      | Record<string, unknown>,
    queryRunner: QueryRunner,
  ): Promise<string | null> {
    if (!queryRunner) {
      throw new BadRequestException(
        `QueryRunner is required when creating specific profiles (CASHIER, DELIVERY, PROVIDER) for role: ${role}`,
      );
    }

    let profileId: string | null = null;

    try {
      switch (role) {
        case SystemRole.CASHIER:
          const cashierData = data as CreateCashierProfileDto;
          const store = await queryRunner.manager.findOne(Store, {
            where: { id: cashierData.storeId },
          });
          if (!store) {
            throw new NotFoundException(
              `Failed to create cashier profile: Store with ID ${cashierData.storeId} not found for role ${role}`,
            );
          }
          const cashierProfile = this.cashierProfileRepository.create({
            ...cashierData,
            store,
          });
          const savedCashier = await queryRunner.manager.save(cashierProfile);
          profileId = savedCashier.id;

          // Validar que el perfil se creó correctamente
          const verifyCashier = await queryRunner.manager.findOne(CashierProfile, {
            where: { id: profileId },
          });
          if (!verifyCashier) {
            throw new InternalServerErrorException(
              `Failed to create cashier profile for role ${role}: profile with ID ${profileId} not found after creation`,
            );
          }
          return profileId;

        case SystemRole.DELIVERY:
          const deliveryData = data as CreateDeliveryProfileDto;
          const deliveryProfile = this.deliveryProfileRepository.create({
            ...deliveryData,
          });
          const savedDelivery = await queryRunner.manager.save(deliveryProfile);
          profileId = savedDelivery.id;

          // Validar que el perfil se creó correctamente
          const verifyDelivery = await queryRunner.manager.findOne(DeliveryProfile, {
            where: { id: profileId },
          });
          if (!verifyDelivery) {
            throw new InternalServerErrorException(
              `Failed to create delivery profile for role ${role}: profile with ID ${profileId} not found after creation`,
            );
          }
          return profileId;

        case SystemRole.PROVIDER:
          const providerData = data as CreateProviderProfileDto;
          const providerProfile = this.providerProfileRepository.create({
            ...providerData,
          });
          const savedProvider = await queryRunner.manager.save(providerProfile);
          profileId = savedProvider.id;

          // Validar que el perfil se creó correctamente
          const verifyProvider = await queryRunner.manager.findOne(ProviderProfile, {
            where: { id: profileId },
          });
          if (!verifyProvider) {
            throw new InternalServerErrorException(
              `Failed to create provider profile for role ${role}: profile with ID ${profileId} not found after creation`,
            );
          }
          return profileId;

        case SystemRole.ADMIN:
        case SystemRole.MANAGER:
        case SystemRole.CUSTOMER:
          return null;

        default:
          throw new BadRequestException(
            `Unsupported role for profile creation: ${role}. Supported roles are CASHIER, DELIVERY, PROVIDER, ADMIN, MANAGER, CUSTOMER`,
          );
      }
    } catch (error) {
      this.logger.error(
        `Error creating profile for role ${role}: ${error.message}. Data: ${JSON.stringify(data)}`,
        error.stack,
      );
      throw error;
    }
  }

  async createProfileForUser(
    userId: string,
    role: SystemRole,
    data?:
      | CreateCashierProfileDto
      | CreateDeliveryProfileDto
      | CreateProviderProfileDto
      | Record<string, unknown>,
    queryRunner?: QueryRunner,
  ): Promise<UserProfile> {
    const manager = queryRunner?.manager || this.userProfileRepository.manager;

    const requiresSpecificProfile = [
      SystemRole.CASHIER,
      SystemRole.DELIVERY,
      SystemRole.PROVIDER,
    ].includes(role);

    let profileId: string | null = null;
    let metadata: Record<string, unknown> | null = null;

    if (requiresSpecificProfile) {
      if (!data) {
        throw new BadRequestException(
          `profileData is required for role ${role} (userId: ${userId}). Roles CASHIER, DELIVERY, and PROVIDER require specific profile data.`,
        );
      }
      if (!queryRunner) {
        throw new BadRequestException(
          `QueryRunner is required when creating profile for role ${role} (userId: ${userId}). This ensures transaction safety.`,
        );
      }
      profileId = await this.createProfileFactory(role, data, queryRunner);
    } else {
      metadata = (data as Record<string, unknown>) || {};
    }

    try {
      const userProfile = this.userProfileRepository.create({
        userId,
        profileType: role,
        profileId,
        metadata,
      });

      const savedProfile = await manager.save(userProfile);

      this.logger.debug(
        `UserProfile created successfully for user ${userId} with role ${role} and profileType ${savedProfile.profileType}`,
        { userId, role, profileType: savedProfile.profileType, profileId: savedProfile.profileId },
      );

      return savedProfile;
    } catch (error) {
      this.logger.error(
        `Failed to create UserProfile for user ${userId} with role ${role}: ${error.message}`,
        error.stack,
        { userId, role, profileId },
      );
      throw new InternalServerErrorException(
        `Failed to create UserProfile for user ${userId} with role ${role}: ${error.message}`,
      );
    }
  }

  async validateProfileCoherence(userId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const user = await this.userProfileRepository.manager
        .createQueryBuilder()
        .select('u.id', 'userId')
        .addSelect('u.roleId', 'roleId')
        .addSelect('r.name', 'roleName')
        .addSelect('up.id', 'profileId')
        .addSelect('up.profile_type', 'profileType')
        .addSelect('up.profile_id', 'specificProfileId')
        .from('users', 'u')
        .leftJoin('roles', 'r', 'r.id = u.roleId')
        .leftJoin('user_profiles', 'up', 'up.userId = u.id')
        .where('u.id = :userId', { userId })
        .andWhere('u.isDelete = false')
        .getRawOne();

      if (!user) {
        errors.push(`User with ID ${userId} not found`);
        return { isValid: false, errors };
      }

      const roleName = user.roleName;
      const profileType = user.profileType;
      const specificProfileId = user.specificProfileId;

      // Validar que roleName no sea null y sea un SystemRole válido
      if (!roleName) {
        errors.push(`User with ID ${userId} does not have a role assigned`);
        return { isValid: false, errors };
      }

      if (!isSystemRole(roleName)) {
        errors.push(`Invalid role name: ${roleName}. Must be a valid SystemRole`);
        return { isValid: false, errors };
      }

      // Validar que roles que requieren perfiles tengan UserProfile y specificProfileId
      const requiresProfile = [
        SystemRole.CASHIER,
        SystemRole.DELIVERY,
        SystemRole.PROVIDER,
      ].includes(roleName);

      if (requiresProfile) {
        if (!user.profileId) {
          errors.push(`User with role ${roleName} requires a UserProfile but none exists`);
        } else if (!specificProfileId) {
          errors.push(
            `User with role ${roleName} requires a specific profile (cashier/delivery/provider) but profileId is null`,
          );
        } else if (profileType && profileType !== roleName) {
          errors.push(`Profile type ${profileType} does not match user role ${roleName}`);
        }
      }

      // Validar coherencia entre role.name y profileType (solo si existe UserProfile)
      if (user.profileId) {
        if (!profileType) {
          errors.push(`UserProfile exists but profileType is null`);
        } else if (profileType !== roleName) {
          errors.push(`Profile type ${profileType} does not match user role ${roleName}`);
        }
      }

      // Validar que profileId exista en la tabla correspondiente
      if (specificProfileId) {
        // Validar que profileType no sea null antes del switch
        if (!profileType) {
          errors.push(
            `Profile ID ${specificProfileId} exists but profileType is null, cannot validate existence`,
          );
        } else if (!isSystemRole(profileType)) {
          errors.push(`Invalid profileType: ${profileType}. Cannot validate profileId existence`);
        } else {
          let exists = false;
          switch (profileType) {
            case SystemRole.CASHIER:
              const cashier = await this.cashierProfileRepository.findOne({
                where: { id: specificProfileId },
              });
              exists = !!cashier;
              break;
            case SystemRole.DELIVERY:
              const delivery = await this.deliveryProfileRepository.findOne({
                where: { id: specificProfileId },
              });
              exists = !!delivery;
              break;
            case SystemRole.PROVIDER:
              const provider = await this.providerProfileRepository.findOne({
                where: { id: specificProfileId },
              });
              exists = !!provider;
              break;
            default:
              // Para roles que no requieren specificProfileId, no validamos existencia
              exists = true;
              break;
          }

          if (!exists) {
            errors.push(
              `Profile ID ${specificProfileId} for type ${profileType} does not exist in the corresponding table`,
            );
          }
        }
      }

      const isValid = errors.length === 0;

      if (!isValid) {
        this.logger.warn(
          `Profile coherence validation failed for user ${userId}. Errors: ${errors.join('; ')}`,
          {
            userId,
            roleName,
            profileType,
            hasProfile: !!user.profileId,
            specificProfileId,
          },
        );
      }

      return {
        isValid,
        errors,
      };
    } catch (error) {
      this.logger.error(
        `Error validating profile coherence for user ${userId}: ${error.message}`,
        error.stack,
        { userId },
      );
      errors.push(`Validation error: ${error.message}`);
      return { isValid: false, errors };
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      return null;
    }

    // Validar coherencia al obtener el perfil
    const validation = await this.validateProfileCoherence(userId);
    if (!validation.isValid) {
      this.logger.warn(
        `Profile coherence issues detected for user ${userId}: ${validation.errors.join(', ')}`,
      );
    }

    if (profile.profileId) {
      switch (profile.profileType) {
        case SystemRole.CASHIER:
          const cashier = await this.cashierProfileRepository.findOne({
            where: { id: profile.profileId },
          });
          if (cashier) {
            (profile as UserProfile & { specificProfile: CashierProfile }).specificProfile =
              cashier;
          }
          break;

        case SystemRole.DELIVERY:
          const delivery = await this.deliveryProfileRepository.findOne({
            where: { id: profile.profileId },
          });
          if (delivery) {
            (profile as UserProfile & { specificProfile: DeliveryProfile }).specificProfile =
              delivery;
          }
          break;

        case SystemRole.PROVIDER:
          const provider = await this.providerProfileRepository.findOne({
            where: { id: profile.profileId },
          });
          if (provider) {
            (profile as UserProfile & { specificProfile: ProviderProfile }).specificProfile =
              provider;
          }
          break;
      }
    }

    return profile;
  }

  async updateProfile(userId: string, data: Record<string, unknown>): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user: ${userId}`);
    }

    if (profile.profileId) {
      switch (profile.profileType) {
        case SystemRole.CASHIER:
          await this.cashierProfileRepository.update(profile.profileId, data);
          break;

        case SystemRole.DELIVERY:
          await this.deliveryProfileRepository.update(profile.profileId, data);
          break;

        case SystemRole.PROVIDER:
          await this.providerProfileRepository.update(profile.profileId, data);
          break;
      }
    } else {
      profile.metadata = { ...profile.metadata, ...data };
      await this.userProfileRepository.save(profile);
    }

    return profile;
  }

  async deleteProfile(userId: string, queryRunner?: QueryRunner): Promise<void> {
    const manager = queryRunner?.manager || this.userProfileRepository.manager;

    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      return;
    }

    if (profile.profileId) {
      switch (profile.profileType) {
        case SystemRole.CASHIER:
          await manager.delete(CashierProfile, { id: profile.profileId });
          break;

        case SystemRole.DELIVERY:
          await manager.delete(DeliveryProfile, { id: profile.profileId });
          break;

        case SystemRole.PROVIDER:
          await manager.delete(ProviderProfile, { id: profile.profileId });
          break;
      }
    }

    await manager.delete(UserProfile, { userId });
  }
}
