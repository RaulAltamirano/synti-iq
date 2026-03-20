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
export class ProfileActivityService {
  private readonly logger = new Logger(ProfileActivityService.name);
  private readonly ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutos en milisegundos
  private readonly operationalRoles = [
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

  async getOnlineStatus(userId: string, roleName: SystemRole): Promise<boolean> {
    if (!this.operationalRoles.includes(roleName)) {
      return false;
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!userProfile?.profileId) {
      return false;
    }

    const lastActivityAt = await this.getLastActivityAt(userId, roleName);

    if (!lastActivityAt) {
      return false;
    }

    const timeSinceLastActivity = new Date().getTime() - lastActivityAt.getTime();
    return timeSinceLastActivity < this.ONLINE_THRESHOLD;
  }

  async getLastActivityAt(userId: string, roleName: SystemRole): Promise<Date | null> {
    if (!this.operationalRoles.includes(roleName)) {
      return null;
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!userProfile?.profileId) {
      return null;
    }

    return await this.fetchLastActivityAt(roleName, userProfile.profileId);
  }

  async updateLastActivity(userId: string, roleName: SystemRole): Promise<void> {
    if (!this.operationalRoles.includes(roleName)) {
      return;
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!userProfile?.profileId) {
      return;
    }

    const now = new Date();
    await this.updateLastActivityForProfile(roleName, userProfile.profileId, now);
  }

  private async fetchLastActivityAt(roleName: SystemRole, profileId: string): Promise<Date | null> {
    switch (roleName) {
      case SystemRole.CASHIER:
        const cashier = await this.cashierProfileRepository.findOne({
          where: { id: profileId },
          select: ['id', 'lastActivityAt'],
        });
        return cashier?.lastActivityAt || null;

      case SystemRole.DELIVERY:
        const delivery = await this.deliveryProfileRepository.findOne({
          where: { id: profileId },
          select: ['id', 'lastActivityAt'],
        });
        return delivery?.lastActivityAt || null;

      case SystemRole.PROVIDER:
        const provider = await this.providerProfileRepository.findOne({
          where: { id: profileId },
          select: ['id', 'lastActivityAt'],
        });
        return provider?.lastActivityAt || null;

      case SystemRole.BUSINESS_OWNER:
        const business = await this.businessProfileRepository.findOne({
          where: { id: profileId },
          select: ['id', 'lastActivityAt'],
        });
        return business?.lastActivityAt || null;

      default:
        return null;
    }
  }

  private async updateLastActivityForProfile(
    roleName: SystemRole,
    profileId: string,
    now: Date,
  ): Promise<void> {
    switch (roleName) {
      case SystemRole.CASHIER:
        await this.cashierProfileRepository.update(profileId, {
          lastActivityAt: now,
        });
        break;

      case SystemRole.DELIVERY:
        await this.deliveryProfileRepository.update(profileId, {
          lastActivityAt: now,
        });
        break;

      case SystemRole.PROVIDER:
        await this.providerProfileRepository.update(profileId, {
          lastActivityAt: now,
        });
        break;

      case SystemRole.BUSINESS_OWNER:
        await this.businessProfileRepository.update(profileId, {
          lastActivityAt: now,
        });
        break;
    }
  }
}
