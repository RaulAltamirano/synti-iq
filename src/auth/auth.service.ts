import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { PasswordService } from './services/password/password.service';
import { UserSessionService } from 'src/user-session/user-session.service';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { RegisterBusinessDto } from 'src/auth/dto/register-business.dto';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { LoginUserDto, RefreshTokensResponseDto } from 'src/auth/dto';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { DataSource, Repository } from 'typeorm';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { SubscriptionStatus } from 'src/subscription/enums/subscription-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { AuthSessionManager } from './services/auth-session-manager.service';
import { AuthMetadataService } from './services/auth-metadata.service';
import { RateLimitService } from './services/rate-limit.service';
import { ReferralService } from 'src/referral/referral.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserService,
    private readonly sessionService: UserSessionService,
    private readonly passwordService: PasswordService,
    private readonly userProfileService: UserProfileService,
    private readonly dataSource: DataSource,
    private readonly sessionManager: AuthSessionManager,
    private readonly metadataService: AuthMetadataService,
    private readonly rateLimitService: RateLimitService,
    private readonly referralService: ReferralService,
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async signUp(dto: SignUpDto, request?: Request): Promise<AuthResponseDto> {
    const forcedRole = SystemRole.CUSTOMER;

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      const days = 14;
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + days);

      const subscription = queryRunner.manager.create(Subscription, {
        customerId: userProfile.profileId,
        status: SubscriptionStatus.TRIALING,
        trialStart: now,
        trialEnd: trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        cancelAtPeriodEnd: false,
      });

      await queryRunner.manager.save(Subscription, subscription);

      const validation = await this.userProfileService.validateProfileCoherence(
        savedUser.id,
        queryRunner,
      );
      if (!validation.isValid) {
        this.logger.error(
          `Profile coherence validation failed after signUp for user ${savedUser.id}: ${validation.errors.join(', ')}`,
        );
        throw new BadRequestException(
          `Profile coherence validation failed: ${validation.errors.join(', ')}`,
        );
      }

      await queryRunner.commitTransaction();

      await this.userRepository.updateLastLogin(savedUser.id);

      const metadata = this.metadataService.extractSessionMetadata(request);
      const { tokens, sessionId } = await this.sessionManager.createSession(savedUser.id, metadata);

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: role.name,
        },
        tokens,
        sessionId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error during signUp: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerBusiness(dto: RegisterBusinessDto, request?: Request): Promise<AuthResponseDto> {
    const forcedRole = SystemRole.BUSINESS_OWNER;

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
        throw new InternalServerErrorException(
          'BusinessProfile was not created during registration',
        );
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

      const validation = await this.userProfileService.validateProfileCoherence(
        savedUser.id,
        queryRunner,
      );
      if (!validation.isValid) {
        this.logger.error(
          `Profile coherence validation failed after registerBusiness for user ${savedUser.id}: ${validation.errors.join(', ')}`,
        );
        throw new BadRequestException(
          `Profile coherence validation failed: ${validation.errors.join(', ')}`,
        );
      }

      await queryRunner.commitTransaction();

      await this.userRepository.updateLastLogin(savedUser.id);

      const metadata = this.metadataService.extractSessionMetadata(request);
      const { tokens, sessionId } = await this.sessionManager.createSession(savedUser.id, metadata);

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

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: role.name,
        },
        tokens,
        sessionId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error during registerBusiness: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginUserDto, request?: Request): Promise<AuthResponseDto> {
    const metadata = this.metadataService.extractSessionMetadata(request);
    const ipAddress = metadata.deviceInfo?.ipAddress || 'unknown';
    await this.rateLimitService.checkRateLimit(dto.email, ipAddress);

    const user = await this.userRepository.findByEmail(dto.email, {
      selectPassword: true,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.validateUserStatus(user);

    const passwordValid = await this.passwordService.verify(dto.password, user.password, dto.email);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.rateLimitService.clearRateLimit(dto.email, ipAddress);
    await this.userRepository.updateLastLogin(user.id);

    await this.invalidatePreviousSessions(user.id, metadata);

    const { tokens, sessionId } = await this.sessionManager.createSession(user.id, metadata);

    const userWithRole = await this.userEntityRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: userWithRole?.firstName,
        lastName: userWithRole?.lastName,
        role: userWithRole?.role?.name,
      },
      tokens,
      sessionId,
    };
  }

  private async invalidatePreviousSessions(
    userId: string,
    metadata: { deviceInfo?: { userAgent?: string | null } },
  ): Promise<void> {
    try {
      if (metadata.deviceInfo?.userAgent) {
        const invalidatedCount = await this.sessionService.invalidateSessionsByDeviceInfo(userId, {
          userAgent: metadata.deviceInfo.userAgent,
        });

        if (invalidatedCount > 0) {
          this.logger.log(
            `Invalidated ${invalidatedCount} previous session(s) for user ${userId} with userAgent: ${metadata.deviceInfo.userAgent}`,
          );
        }
      } else {
        this.logger.warn(
          `Cannot invalidate previous sessions for user ${userId}: userAgent is not available`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate previous sessions for user ${userId}: ${error.message}`,
        error.stack,
      );
    }
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    const sessionId = this.sessionManager.extractSessionIdFromToken(accessToken, userId);
    if (!sessionId) {
      await this.sessionManager.invalidateAllSessions(userId);
      return;
    }

    await this.sessionManager.invalidateSession(userId, sessionId);
  }

  async refreshTokens(dto: RefreshTokenDto, request?: Request): Promise<RefreshTokensResponseDto> {
    const { userId, sessionId } = await this.sessionManager.verifyRefreshToken(dto.refreshToken);

    const isValidSession = await this.sessionService.validateSessionOwnership(userId, sessionId);
    if (!isValidSession) {
      throw new UnauthorizedException('Invalid session');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.validateUserStatus(user);
    await this.sessionService.updateSessionLastUsed(userId, sessionId);
    await this.userRepository.updateLastActivity(userId);

    const metadata = this.metadataService.extractSessionMetadata(request);
    return this.sessionManager.refreshSession(userId, sessionId, dto.refreshToken, metadata);
  }

  async validateUserAndSession(userId: string, sessionId?: string): Promise<User> {
    try {
      if (!userId) {
        throw new UnauthorizedException('User ID is required');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      this.validateUserStatus(user);

      if (!sessionId) {
        this.logger.warn(`Session ID missing for user: ${userId}`);
        throw new UnauthorizedException('Session ID is required');
      }

      await this.validateSession(userId, sessionId);

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        this.logger.warn(`User/session validation failed: ${error.message}`, { userId, sessionId });
        throw error;
      }

      this.logger.error(`User validation error: ${error.message}`, error.stack, {
        userId,
        sessionId,
      });
      throw new InternalServerErrorException('Authentication error');
    }
  }

  private validateUserStatus(user: User): void {
    if (user.isDelete) {
      throw new UnauthorizedException('User account is no longer active');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive. Please contact support.');
    }
  }

  private async validateSession(userId: string, sessionId: string): Promise<void> {
    const isValid = await this.sessionService.validateSessionOwnership(userId, sessionId);
    if (!isValid) {
      this.logger.warn(`Session validation failed: userId=${userId}, sessionId=${sessionId}`);
      throw new UnauthorizedException('Invalid session');
    }

    await this.sessionService.updateSessionLastUsed(userId, sessionId);
    await this.userRepository.updateLastActivity(userId);
  }
}
