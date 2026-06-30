import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { SystemRole, isSystemRole } from 'src/shared/enums/roles.enum';
import { User } from 'src/user/entities/user.entity';
import { UserProfile } from '../entities/user_profile.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';

@Injectable()
export class ProfileValidationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(CashierProfile)
    private readonly cashierProfileRepository: Repository<CashierProfile>,
    @InjectRepository(DeliveryProfile)
    private readonly deliveryProfileRepository: Repository<DeliveryProfile>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(BusinessProfile)
    private readonly businessProfileRepository: Repository<BusinessProfile>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async validate(
    userId: string,
    queryRunner?: QueryRunner,
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const manager = queryRunner?.manager || this.userProfileRepository.manager;

    try {
      const user = await manager.findOne(User, {
        where: { id: userId, deletedAt: IsNull() },
        relations: ['role', 'profile'],
      });

      if (!user) {
        errors.push(`User with ID ${userId} not found`);
        return { isValid: false, errors };
      }

      const roleName = user.role?.name;
      const profileType = user.profile?.profileType;
      const specificProfileId = user.profile?.profileId;

      // Validar que roleName no sea null y sea un SystemRole válido
      if (!roleName) {
        errors.push(`User with ID ${userId} does not have a role assigned`);
        return { isValid: false, errors };
      }

      if (!isSystemRole(roleName)) {
        errors.push(`Invalid role name: ${roleName}. Must be a valid SystemRole`);
        return { isValid: false, errors };
      }

      const requiresProfile = [
        SystemRole.CASHIER,
        SystemRole.DELIVERY,
        SystemRole.PROVIDER,
        SystemRole.BUSINESS_OWNER,
        SystemRole.CUSTOMER,
      ].includes(roleName);

      if (requiresProfile) {
        if (!user.profile) {
          errors.push(`User with role ${roleName} requires a UserProfile but none exists`);
        } else if (!specificProfileId) {
          if (roleName === SystemRole.CUSTOMER) {
            errors.push(
              `User with role ${roleName} requires a CustomerProfile but profileId is null`,
            );
          } else {
            errors.push(
              `User with role ${roleName} requires a specific profile (cashier/delivery/provider/business_owner) but profileId is null`,
            );
          }
        } else if (profileType && profileType !== roleName) {
          errors.push(`Profile type ${profileType} does not match user role ${roleName}`);
        }

        // Validación adicional para CUSTOMER: debe tener Subscription
        if (roleName === SystemRole.CUSTOMER && specificProfileId) {
          const subscription = await manager.findOne(Subscription, {
            where: { customerId: specificProfileId },
          });
          if (!subscription) {
            errors.push(
              `Customer with profile ID ${specificProfileId} must have at least one Subscription`,
            );
          }
        }
      }

      if (user.profile) {
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
          const exists = await this.validateSpecificProfileExists(
            profileType,
            specificProfileId,
            manager,
          );

          if (!exists) {
            errors.push(
              `Profile ID ${specificProfileId} for type ${profileType} does not exist in the corresponding table`,
            );
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      return { isValid: false, errors };
    }
  }

  private async validateSpecificProfileExists(
    profileType: SystemRole,
    profileId: string,
    manager: QueryRunner['manager'],
  ): Promise<boolean> {
    switch (profileType) {
      case SystemRole.CASHIER:
        const cashier = await manager.findOne(CashierProfile, {
          where: { id: profileId },
        });
        return !!cashier;

      case SystemRole.DELIVERY:
        const delivery = await manager.findOne(DeliveryProfile, {
          where: { id: profileId },
        });
        return !!delivery;

      case SystemRole.PROVIDER:
        const provider = await manager.findOne(ProviderProfile, {
          where: { id: profileId },
        });
        return !!provider;

      case SystemRole.BUSINESS_OWNER:
        const business = await manager.findOne(BusinessProfile, {
          where: { id: profileId },
        });
        return !!business;

      case SystemRole.CUSTOMER:
        const customer = await manager.findOne(CustomerProfile, {
          where: { id: profileId },
        });
        return !!customer;

      default:
        return true;
    }
  }
}
