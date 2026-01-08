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
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { LoginUserDto, TokensUserDto } from 'src/auth/dto';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { UserProfileService } from 'src/user_profile/user_profile.service';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { AuthSessionManager } from './services/auth-session-manager.service';
import { AuthMetadataService } from './services/auth-metadata.service';
import { RateLimitService } from './services/rate-limit.service';

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
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async signUp(dto: SignUpDto, request?: Request): Promise<AuthResponseDto> {
    if (dto.role !== SystemRole.CUSTOMER) {
      throw new BadRequestException(
        'Public registration is only allowed for CUSTOMER role. Please contact an administrator for other roles.',
      );
    }

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const role = await this.roleRepository.findOne({
        where: { name: SystemRole.CUSTOMER },
      });

      if (!role) {
        throw new InternalServerErrorException('CUSTOMER role not found');
      }

      const hashedPassword = await this.passwordService.hash(dto.password);
      const user = this.userEntityRepository.create({
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        roleId: role.id,
        isActive: true,
        createdAt: new Date(),
      });

      const savedUser = await queryRunner.manager.save(user);

      const userProfile = await this.userProfileService.createProfileForUser(
        savedUser.id,
        SystemRole.CUSTOMER,
        {},
        queryRunner,
      );

      const validation = await this.userProfileService.validateProfileCoherence(savedUser.id);
      if (!validation.isValid) {
        this.logger.error(
          `Profile coherence validation failed after signUp for user ${savedUser.id}: ${validation.errors.join(', ')}`,
        );
        throw new BadRequestException(
          `Profile coherence validation failed: ${validation.errors.join(', ')}`,
        );
      }

      await queryRunner.commitTransaction();

      const metadata = this.metadataService.extractSessionMetadata(request);
      const tokens = await this.sessionManager.createSession(savedUser.id, metadata);

      return {
        user: { id: savedUser.id, email: savedUser.email },
        tokens,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error during signUp: ${error.message}`, error.stack);
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

    const tokens = await this.sessionManager.createSession(user.id, metadata);

    return {
      user: { id: user.id, email: user.email },
      tokens,
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

  async refreshTokens(dto: RefreshTokenDto, request?: Request): Promise<TokensUserDto> {
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
  }
}
