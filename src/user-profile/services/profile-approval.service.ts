import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery-profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider-profile/entities/provider_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { UserProfile } from '../entities/user_profile.entity';

@Injectable()
export class ProfileApprovalService {
  private readonly logger = new Logger(ProfileApprovalService.name);
  private readonly rolesRequiringApproval = [
    SystemRole.CASHIER,
    SystemRole.DELIVERY,
    SystemRole.PROVIDER,
    SystemRole.BUSINESS_OWNER,
  ];

  constructor(
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
  ) {}

  async getApprovalStatus(
    userId: string,
    roleName: SystemRole,
  ): Promise<{
    isApproved: boolean;
    approvedAt: Date | null;
    approvedBy: string | null;
  }> {
    if (!this.rolesRequiringApproval.includes(roleName)) {
      return { isApproved: true, approvedAt: null, approvedBy: null };
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!userProfile?.profileId) {
      return { isApproved: false, approvedAt: null, approvedBy: null };
    }

    const profile = await this.fetchProfileForApproval(roleName, userProfile.profileId);

    if (!profile) {
      return { isApproved: false, approvedAt: null, approvedBy: null };
    }

    return {
      isApproved: profile.isApproved || false,
      approvedAt: profile.approvedAt || null,
      approvedBy: profile.approvedBy || null,
    };
  }

  private async fetchProfileForApproval(
    roleName: SystemRole,
    profileId: string,
  ): Promise<CashierProfile | DeliveryProfile | ProviderProfile | BusinessProfile | null> {
    switch (roleName) {
      case SystemRole.CASHIER:
        return await this.cashierProfileRepository.findOne({
          where: { id: profileId },
        });

      case SystemRole.DELIVERY:
        return await this.deliveryProfileRepository.findOne({
          where: { id: profileId },
        });

      case SystemRole.PROVIDER:
        return await this.providerProfileRepository.findOne({
          where: { id: profileId },
        });

      case SystemRole.BUSINESS_OWNER:
        return await this.businessProfileRepository.findOne({
          where: { id: profileId },
        });

      default:
        return null;
    }
  }
}
