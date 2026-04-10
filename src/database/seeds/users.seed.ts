import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { ReferralCode } from 'src/referral/entities/referral_code.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { PasswordService } from 'src/auth/services/password/password.service';
import { generateUniqueReferralCode } from 'src/referral/utils/generate-referral-code.util';

@Injectable()
export class UsersSeed {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(BusinessProfile)
    private readonly businessProfileRepository: Repository<BusinessProfile>,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async seed(): Promise<void> {
    const ownerEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@syntiiq.com');
    const ownerPassword = this.configService.get<string>('ADMIN_PASSWORD', 'Admin123');
    const ownerFirstName = this.configService.get<string>('ADMIN_FIRST_NAME', 'System');
    const ownerLastName = this.configService.get<string>('ADMIN_LAST_NAME', 'Administrator');
    const businessName = this.configService.get<string>('ADMIN_BUSINESS_NAME', 'SyntiIQ');

    const businessOwnerRole = await this.roleRepository.findOne({
      where: { name: SystemRole.BUSINESS_OWNER },
    });

    if (!businessOwnerRole) {
      throw new NotFoundException('BUSINESS_OWNER role not found. Please run roles seed first.');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: ownerEmail },
    });

    if (existingUser) {
      this.logger.log(
        `Business owner user with email ${ownerEmail} already exists. Skipping creation.`,
      );
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.passwordService.hash(ownerPassword);

      const businessProfile = queryRunner.manager.create(BusinessProfile, {
        name: businessName,
        isApproved: true,
      });
      const savedBusiness = await queryRunner.manager.save(BusinessProfile, businessProfile);
      this.logger.log(`Created business profile: ${savedBusiness.name} (ID: ${savedBusiness.id})`);

      const userData = {
        email: ownerEmail,
        password: hashedPassword,
        firstName: ownerFirstName,
        lastName: ownerLastName,
        roleId: businessOwnerRole.id,
        isActive: true,
      };

      const user = queryRunner.manager.create(User, userData);
      const savedUser = await queryRunner.manager.save(User, user);
      this.logger.log(`Created business owner user: ${savedUser.email} (ID: ${savedUser.id})`);

      const userProfile = queryRunner.manager.create(UserProfile, {
        userId: savedUser.id,
        profileType: SystemRole.BUSINESS_OWNER,
        profileId: savedBusiness.id,
        metadata: {},
      });

      await queryRunner.manager.save(UserProfile, userProfile);
      this.logger.log(`Created business owner user profile for user: ${savedUser.id}`);

      const referralCode = await this.createReferralCode(savedBusiness.id, queryRunner.manager);
      this.logger.log(
        `Created referral code: ${referralCode.code} for business ${savedBusiness.id}`,
      );

      await queryRunner.commitTransaction();
      this.logger.log('✅ Business owner user seed completed successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error seeding business owner user: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createReferralCode(
    businessProfileId: string,
    manager: EntityManager,
  ): Promise<ReferralCode> {
    const code = await generateUniqueReferralCode(c =>
      manager.findOne(ReferralCode, { where: { code: c } }).then(Boolean),
    );
    const referralCode = manager.create(ReferralCode, {
      code,
      businessProfileId,
      trialDaysBonus: 0,
      discountPercentage: 0,
    });
    return manager.save(ReferralCode, referralCode);
  }

  async validate(): Promise<{ valid: boolean; missing: string[] }> {
    const ownerEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@syntiiq.com');
    const ownerUser = await this.userRepository.findOne({
      where: { email: ownerEmail },
      relations: ['role'],
    });

    if (!ownerUser) {
      return {
        valid: false,
        missing: [`Business owner user with email ${ownerEmail}`],
      };
    }

    if (ownerUser.role?.name !== SystemRole.BUSINESS_OWNER) {
      return {
        valid: false,
        missing: [`User ${ownerEmail} does not have BUSINESS_OWNER role`],
      };
    }

    const profile = await this.userProfileRepository.findOne({
      where: { userId: ownerUser.id },
    });

    if (!profile || !profile.profileId) {
      return {
        valid: false,
        missing: [`User profile with BusinessProfile for user ${ownerEmail}`],
      };
    }

    return {
      valid: true,
      missing: [],
    };
  }
}
