import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { DeliveryProfile } from 'src/delivery_profiles/entities/delivery_profile.entity';
import { ProviderProfile } from 'src/provider_profile/entities/provider_profile.entity';
import { UserProfile } from '../entities/user_profile.entity';

@Injectable()
export class ProfileApprovalService {
  private readonly logger = new Logger(ProfileApprovalService.name);
  private readonly rolesRequiringApproval = [
    SystemRole.CASHIER,
    SystemRole.DELIVERY,
    SystemRole.PROVIDER,
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
  ): Promise<CashierProfile | DeliveryProfile | ProviderProfile | null> {
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

      default:
        return null;
    }
  }
}
