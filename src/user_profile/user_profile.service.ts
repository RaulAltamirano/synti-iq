import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { UserProfile } from './entities/user_profile.entity';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery_profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider_profile/entities/provider_profile.entity';
import { CreateCashierProfileDto } from 'src/cashier_profile/dto/create-cashier-profile.dto';
import { CreateDeliveryProfileDto } from 'src/delivery_profiles/dto/create-delivery-profile.dto';
import { CreateProviderProfileDto } from 'src/provider_profile/dto/create-provider-profile.dto';
import { CustomerProfile } from 'src/customer_profile/entities/customer_profile.entity';
import { ProfileFactoryService } from './services/profile-factory.service';
import { ProfileValidationService } from './services/profile-validation.service';
import { ProfileActivityService } from './services/profile-activity.service';
import { ProfileApprovalService } from './services/profile-approval.service';
import { ProfileRepositoryHelper } from './helpers/profile-repository.helper';

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
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    private readonly profileFactoryService: ProfileFactoryService,
    private readonly profileValidationService: ProfileValidationService,
    private readonly profileActivityService: ProfileActivityService,
    private readonly profileApprovalService: ProfileApprovalService,
  ) {}

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
      SystemRole.CUSTOMER,
    ].includes(role);

    let profileId: string | null = null;
    let metadata: Record<string, unknown> | null = null;

    if (requiresSpecificProfile) {
      if (role !== SystemRole.CUSTOMER && !data) {
        throw new BadRequestException(
          `profileData is required for role ${role} (userId: ${userId}). Roles CASHIER, DELIVERY, and PROVIDER require specific profile data.`,
        );
      }
      if (!queryRunner) {
        throw new BadRequestException(
          `QueryRunner is required when creating profile for role ${role} (userId: ${userId}). This ensures transaction safety.`,
        );
      }
      profileId = await this.profileFactoryService.createProfile(role, data, queryRunner);
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

  async validateProfileCoherence(
    userId: string,
    queryRunner?: QueryRunner,
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    return this.profileValidationService.validate(userId, queryRunner);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      return null;
    }

    const validation = await this.validateProfileCoherence(userId);
    if (!validation.isValid) {
      this.logger.warn(
        `Profile coherence issues detected for user ${userId}: ${validation.errors.join(', ')}`,
      );
    }

    if (profile.profileId && profile.profileType) {
      await this.loadSpecificProfile(profile);
    }

    return profile;
  }

  private async loadSpecificProfile(profile: UserProfile): Promise<void> {
    switch (profile.profileType) {
      case SystemRole.CASHIER:
        const cashier = await this.cashierProfileRepository.findOne({
          where: { id: profile.profileId },
        });
        if (cashier) {
          (profile as UserProfile & { specificProfile: CashierProfile }).specificProfile = cashier;
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

      case SystemRole.CUSTOMER:
        const customer = await this.customerProfileRepository.findOne({
          where: { id: profile.profileId },
          relations: ['subscriptions'],
        });
        if (customer) {
          (profile as UserProfile & { specificProfile: CustomerProfile }).specificProfile =
            customer;
        }
        break;
    }
  }

  async updateProfile(userId: string, data: Record<string, unknown>): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user: ${userId}`);
    }

    if (profile.profileId && profile.profileType) {
      const repository = ProfileRepositoryHelper.getRepositoryForProfileType(profile.profileType, {
        cashier: this.cashierProfileRepository,
        delivery: this.deliveryProfileRepository,
        provider: this.providerProfileRepository,
        customer: this.customerProfileRepository,
      });

      if (repository) {
        await repository.update(profile.profileId, data);
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

    if (profile.profileId && profile.profileType) {
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

        case SystemRole.CUSTOMER:
          await manager.delete(CustomerProfile, { id: profile.profileId });
          break;
      }
    }

    await manager.delete(UserProfile, { userId });
  }

  async getApprovalStatus(
    userId: string,
    roleName: SystemRole,
  ): Promise<{
    isApproved: boolean;
    approvedAt: Date | null;
    approvedBy: string | null;
  }> {
    return this.profileApprovalService.getApprovalStatus(userId, roleName);
  }

  async getOnlineStatus(userId: string, roleName: SystemRole): Promise<boolean> {
    return this.profileActivityService.getOnlineStatus(userId, roleName);
  }

  async updateLastActivity(userId: string, roleName: SystemRole): Promise<void> {
    return this.profileActivityService.updateLastActivity(userId, roleName);
  }

  async getLastActivityAt(userId: string, roleName: SystemRole): Promise<Date | null> {
    return this.profileActivityService.getLastActivityAt(userId, roleName);
  }
}
