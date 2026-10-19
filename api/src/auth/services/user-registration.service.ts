import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { PasswordService } from 'src/password/password.service';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { RegisterBusinessDto } from 'src/auth/dto/register-business.dto';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { SubscriptionStatus } from 'src/subscription/enums/subscription-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { AuthSessionManager } from 'src/auth/services/auth-session-manager.service';
import { AuthMetadataService } from 'src/auth/services/auth-metadata.service';
import { ReferralService } from 'src/referral/referral.service';
import { MailService } from 'src/mail/mail.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import {
  AUTH_CORE_SPAN_ATTRIBUTES,
  AUTH_REGISTRATION_SPAN_NAMES,
} from 'src/auth/constants/auth-span.constants';

interface RegistrationTxResult {
  savedUser: User;
  roleName: string;
}

@Injectable()
export class UserRegistrationService {
  private readonly logger = new Logger(UserRegistrationService.name);

  constructor(
    private readonly userRepository: UserService,
    private readonly passwordService: PasswordService,
    private readonly userProfileService: UserProfileService,
    private readonly dataSource: DataSource,
    private readonly sessionManager: AuthSessionManager,
    private readonly metadataService: AuthMetadataService,
    private readonly referralService: ReferralService,
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async signUp(dto: SignUpDto, request?: Request): Promise<AuthResponseDto> {
    return this.observabilityService.withSpan(AUTH_REGISTRATION_SPAN_NAMES.SIGNUP, async span => {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const { savedUser, roleName } = await this.runInTransaction('signUp', qr =>
        this.executeSignUpTransaction(qr, dto),
      );

      span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, savedUser.id);

      return this.buildAuthResponseAfterRegistration(savedUser, roleName, request);
    });
  }

  async registerBusiness(dto: RegisterBusinessDto, request?: Request): Promise<AuthResponseDto> {
    return this.observabilityService.withSpan(
      AUTH_REGISTRATION_SPAN_NAMES.REGISTER_BUSINESS,
      async span => {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }

        const { savedUser, roleName } = await this.runInTransaction('registerBusiness', qr =>
          this.executeRegisterBusinessTransaction(qr, dto),
        );

        span.setAttribute(AUTH_CORE_SPAN_ATTRIBUTES.USER_ID, savedUser.id);

        const response = await this.buildAuthResponseAfterRegistration(
          savedUser,
          roleName,
          request,
        );

        this.mailService
          .sendWelcomeBusiness({
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            businessName: dto.businessName,
          })
          .catch((err: Error) => {
            this.logger.warn(`Welcome email failed for ${savedUser.email}: ${err.message}`);
          });

        return response;
      },
    );
  }

  /**
   * Runs work inside a TypeORM transaction: commit on success, rollback + log + rethrow on failure.
   * Post-commit side effects (session, email) must run after this resolves.
   */
  private async runInTransaction<T>(
    label: string,
    work: (qr: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await work(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error during ${label}: ${message}`, stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async executeSignUpTransaction(
    queryRunner: QueryRunner,
    dto: SignUpDto,
  ): Promise<RegistrationTxResult> {
    const forcedRole = SystemRole.CUSTOMER;

    const role = await this.roleRepository.findOne({
      where: { name: forcedRole },
    });

    if (!role) {
      throw new InternalServerErrorException('CUSTOMER role not found');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);
    const user = this.userEntityRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleId: role.id,
      isActive: true,
      createdAt: new Date(),
    });

    const savedUser = await queryRunner.manager.save(user);

    const userProfile = await this.userProfileService.createProfileForUser(
      savedUser.id,
      forcedRole,
      {},
      queryRunner,
    );

    if (!userProfile.profileId) {
      throw new InternalServerErrorException('CustomerProfile was not created during signup');
    }

    await this.saveTrialingSubscriptionForCustomer(queryRunner, userProfile.profileId);
    await this.assertProfileCoherenceOrThrow('signUp', savedUser.id, queryRunner);

    return { savedUser, roleName: role.name };
  }

  private async executeRegisterBusinessTransaction(
    queryRunner: QueryRunner,
    dto: RegisterBusinessDto,
  ): Promise<RegistrationTxResult> {
    const forcedRole = SystemRole.BUSINESS_OWNER;

    const role = await this.roleRepository.findOne({
      where: { name: forcedRole },
    });

    if (!role) {
      throw new InternalServerErrorException('BUSINESS_OWNER role not found');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);
    const user = this.userEntityRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleId: role.id,
      isActive: true,
      createdAt: new Date(),
    });

    const savedUser = await queryRunner.manager.save(user);

    const businessProfileData = { name: dto.businessName };
    const userProfile = await this.userProfileService.createProfileForUser(
      savedUser.id,
      forcedRole,
      businessProfileData,
      queryRunner,
    );

    if (!userProfile.profileId) {
      throw new InternalServerErrorException('BusinessProfile was not created during registration');
    }

    if (dto.referralCode?.trim()) {
      const referralValidation = await this.referralService.validateCode(dto.referralCode.trim());
      if (referralValidation.isValid && referralValidation.referralCodeId) {
        await this.referralService.recordUsage(
          referralValidation.referralCodeId,
          savedUser.id,
          userProfile.profileId,
          queryRunner,
        );
      }
    }

    await this.referralService.ensureCodeForBusinessProfile(userProfile.profileId, queryRunner);
    await this.assertProfileCoherenceOrThrow('registerBusiness', savedUser.id, queryRunner);

    return { savedUser, roleName: role.name };
  }

  private async saveTrialingSubscriptionForCustomer(
    queryRunner: QueryRunner,
    customerProfileId: string,
  ): Promise<void> {
    const days = 14;
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + days);

    const subscription = queryRunner.manager.create(Subscription, {
      customerId: customerProfileId,
      status: SubscriptionStatus.TRIALING,
      trialStart: now,
      trialEnd: trialEnd,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      cancelAtPeriodEnd: false,
    });

    await queryRunner.manager.save(Subscription, subscription);
  }

  private async assertProfileCoherenceOrThrow(
    context: 'signUp' | 'registerBusiness',
    savedUserId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const validation = await this.userProfileService.validateProfileCoherence(
      savedUserId,
      queryRunner,
    );
    if (!validation.isValid) {
      this.logger.error(
        `Profile coherence validation failed after ${context} for user ${savedUserId}: ${validation.errors.join(', ')}`,
      );
      throw new BadRequestException(
        `Profile coherence validation failed: ${validation.errors.join(', ')}`,
      );
    }
  }

  private async buildAuthResponseAfterRegistration(
    savedUser: User,
    roleName: string,
    request?: Request,
  ): Promise<AuthResponseDto> {
    await this.userRepository.updateLastLogin(savedUser.id);
    const metadata = this.metadataService.extractSessionMetadata(request);
    const { tokens, sessionId } = await this.sessionManager.createSession(savedUser.id, metadata);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: roleName,
      },
      tokens,
      sessionId,
    };
  }
}
