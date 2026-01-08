import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { UserProfile } from 'src/user_profile/entities/user_profile.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { PasswordService } from 'src/auth/services/password/password.service';

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
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async seed(): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@syntiiq.com');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'Admin123');
    const adminFullName = this.configService.get<string>('ADMIN_FULL_NAME', 'System Administrator');

    const adminRole = await this.roleRepository.findOne({
      where: { name: SystemRole.ADMIN },
    });

    if (!adminRole) {
      throw new NotFoundException('ADMIN role not found. Please run roles seed first.');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingUser) {
      this.logger.log(`Admin user with email ${adminEmail} already exists. Skipping creation.`);
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.passwordService.hash(adminPassword);

      const user = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        fullName: adminFullName,
        roleId: adminRole.id,
        isActive: true,
        isApproved: true,
      });

      const savedUser = await queryRunner.manager.save(user);
      this.logger.log(`Created admin user: ${savedUser.email} (ID: ${savedUser.id})`);

      const userProfile = this.userProfileRepository.create({
        userId: savedUser.id,
        profileType: SystemRole.ADMIN,
        profileId: null,
        metadata: {},
      });

      await queryRunner.manager.save(userProfile);
      this.logger.log(`Created admin user profile for user: ${savedUser.id}`);

      await queryRunner.commitTransaction();
      this.logger.log('✅ Admin user seed completed successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error seeding admin user: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validate(): Promise<{ valid: boolean; missing: string[] }> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@syntiiq.com');
    const adminUser = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['role'],
    });

    if (!adminUser) {
      return {
        valid: false,
        missing: [`Admin user with email ${adminEmail}`],
      };
    }

    if (adminUser.role?.name !== SystemRole.ADMIN) {
      return {
        valid: false,
        missing: [`Admin user ${adminEmail} does not have ADMIN role`],
      };
    }

    const profile = await this.userProfileRepository.findOne({
      where: { userId: adminUser.id },
    });

    if (!profile) {
      return {
        valid: false,
        missing: [`User profile for admin user ${adminEmail}`],
      };
    }

    return {
      valid: true,
      missing: [],
    };
  }
}
