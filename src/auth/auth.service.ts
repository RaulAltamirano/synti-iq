import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { PasswordService } from './services/password/password.service';
import { TokenFactory } from 'src/auth/factory/token-factory';
import { UserSessionService } from 'src/user-session/user-session.service';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { LoginUserDto, TokensUserDto } from 'src/auth/dto';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';
import { CreateUserSessionDto } from 'src/user-session/dto/create-user-session.dto';
import { RedisService } from 'src/shared/redis/redis.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { isIP } from 'net';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SessionFilterDto } from './dto/session-filter.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { UserSession } from 'src/user-session/entities/user-session.entity';
import { UserSessionResponseDto } from 'src/user-session/dto/user-session-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_WINDOW = 15 * 60;
  private readonly CACHE_PREFIX = 'active_sessions';

  constructor(
    private readonly userRepository: UserService,
    private readonly sessionRepository: UserSessionService,
    private readonly tokenFactory: TokenFactory,
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async signUp(dto: SignUpDto, request?: Request): Promise<AuthResponseDto> {
    this.logger.log(`Registering user: ${dto.email}`);

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    if (!user) {
      throw new InternalServerErrorException('User creation failed');
    }

    const metadata = this.extractSessionMetadata(request);
    const tokens = await this.createUserSession({
      userId: user.id,
      ...metadata,
    });

    return {
      user: { id: user.id, email: user.email },
      tokens,
    };
  }

  async login(dto: LoginUserDto, request?: Request): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt for user: ${dto.email}`);

    const metadata = this.extractSessionMetadata(request);
    await this.checkRateLimit(dto.email, metadata.ipAddress || 'unknown');

    const user = await this.userRepository.findByEmail(dto.email, {
      selectPassword: true,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.passwordService.verify(
      dto.password,
      user.password,
      dto.email,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset rate limit counter on successful login
    const key = `login_attempts:${dto.email}:${metadata.ipAddress || 'unknown'}`;
    await this.redisService.del(key);

    await this.userRepository.updateLastLogin(user.id);

    const tokens = await this.createUserSession({
      userId: user.id,
      ...metadata,
    });

    return {
      user: { id: user.id, email: user.email },
      tokens,
    };
  }

  async getProfile(token: string): Promise<any> {
    try {
      const decoded = this.tokenFactory.decodeToken(token);
      if (!decoded?.sub) {
        throw new UnauthorizedException('Token inválido');
      }
      this.logger.warn({ decoded });
      const user = await this.userRepository.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        roles: user.roles,
      };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Sesión expirada o inválida');
      }
      throw error;
    }
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    const sessionId = this.extractSessionIdFromToken(accessToken, userId);
    if (!sessionId) {
      await this.sessionRepository.invalidateAllSessions(userId);
      return;
    }
    await this.sessionRepository.invalidateSession(userId, sessionId);
  }

  /**
   * Get all active sessions for a user
   * @param userId - The user's ID
   * @returns Array of active sessions
   */
  async getActiveSessions(userId: string, filters: SessionFilterDto): Promise<PaginatedResponse<UserSessionResponseDto>> {
    try {
      const cacheKey = PaginationCacheUtil.buildCacheKey(`${this.CACHE_PREFIX}_${userId}`, filters);
      const cachedResult = await this.cacheManager.get<PaginatedResponse<UserSessionResponseDto>>(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }

      const response = await this.sessionRepository.getActiveSessions(userId, filters);
      await this.cacheManager.set(cacheKey, response, 300);
      return response;
    } catch (error) {
      this.logger.error(`Error getting active sessions: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get active sessions');
    }
  }

  /**
   * Delete a specific device session
   * @param userId - The user's ID
   * @param sessionId - The session ID to delete
   */
  async deleteDeviceSession(userId: string, sessionId: string): Promise<void> {
    try {
      await this.sessionRepository.invalidateSession(userId, sessionId);
    } catch (error) {
      this.logger.error(`Error deleting device session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete device session');
    }
  }

  /**
   * Close all sessions for a user
   * @param userId - The user's ID
   */
  async closeAllSessions(userId: string): Promise<void> {
    try {
      await this.sessionRepository.invalidateAllSessions(userId);
    } catch (error) {
      this.logger.error(`Error closing all sessions: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to close all sessions');
    }
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<TokensUserDto> {
    this.logger.log('running refresh token');
    const { userId, sessionId } = await this.tokenFactory.verifyRefreshToken(
      dto.refreshToken,
    );

    const isValidSession =
      await this.sessionRepository.validateSessionOwnership(userId, sessionId);
    if (!isValidSession) {
      throw new UnauthorizedException('Invalid session');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.tokenFactory.generateTokens(user.id, sessionId);
  }

  async validateUserAndSession(
    userId: string,
    sessionId?: string,
    tokenId?: string,
  ): Promise<any> {
    try {
      this.logger.log('validateUserAndSession');
      const user = await this.validateUser(userId);
      if (sessionId) {
        await this.validateSession(userId, sessionId);
      }
      this.logger.warn(tokenId);

      return user;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(`User validation error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Authentication error');
    }
  }

  async validateToken(userId: string, tokenId: string): Promise<void> {
    try {
      const payload = this.tokenFactory.verifyAccessToken(tokenId);
      this.logger.debug({ tokenId });

      if (!payload || payload.sub !== userId) {
        throw new ForbiddenException('Token user ID mismatch');
      }

      if (!payload.sid) {
        throw new UnauthorizedException('Session ID missing in token');
      }

      await this.validateSession(userId, payload.sid);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error(
        `Token validation failed: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private async validateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`User validation failed: User ${userId} not found`);
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private async validateSession(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const session = await this.sessionRepository.validateSessionOwnership(
      userId,
      sessionId,
    );
    if (!session) {
      this.logger.warn(
        `Session validation failed: Session ${sessionId} not found for user ${userId}`,
      );
      throw new UnauthorizedException('Invalid session');
    }

    await this.sessionRepository.updateSessionLastUsed(userId, sessionId);
  }

  private async createUserSession(
    dto: CreateUserSessionDto,
  ): Promise<TokensUserDto> {
    try {
      if (!dto.userId) {
        throw new BadRequestException('User ID is required');
      }

      const sessionId = this.tokenFactory.generateId();
      const tokens = await this.tokenFactory.generateTokens(
        dto.userId,
        sessionId,
      );

      const hashedToken = await this.passwordService.hash(
        tokens.refreshToken.token,
      );

      const createSessionDto: CreateUserSessionDto = {
        userId: dto.userId,
        refreshToken: hashedToken,
        userAgent: dto.userAgent,
        ipAddress: dto.ipAddress,
        sessionId,
      };

      await this.sessionRepository.createSession({
        ...createSessionDto,
      });

      this.logger.debug(
        `Created new session ${sessionId} for user ${dto.userId}`,
      );

      return tokens;
    } catch (error) {
      this.logger.error(
        `Error creating user session for user ${dto?.userId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create user authentication session',
      );
    }
  }

  private extractSessionMetadata(request?: Request): any {
    const userAgent = request?.headers['user-agent'];
    const forwardedFor = request?.headers['x-forwarded-for']?.toString();
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    // Validate IP address
    if (ipAddress && !isIP(ipAddress)) {
      this.logger.warn(`Invalid IP address detected: ${ipAddress}`);
      return {
        userAgent: userAgent || null,
        ipAddress: null,
        lastUsed: new Date(),
      };
    }

    return {
      userAgent: userAgent || null,
      ipAddress,
      lastUsed: new Date(),
    };
  }

  private extractSessionIdFromToken(
    accessToken: string,
    userId: string,
  ): string | null {
    try {
      const decoded = this.tokenFactory.verifyAccessToken(accessToken);
      if (decoded.sub !== userId) {
        throw new UnauthorizedException('Invalid token ownership');
      }
      return decoded.sid;
    } catch (error) {
      this.logger.warn(`Failed to verify access token: ${error.message}`);
      const unverified = this.tokenFactory.decodeToken(accessToken);
      return unverified?.sub === userId ? unverified.sid : null;
    }
  }

  private async checkRateLimit(email: string, ip: string): Promise<void> {
    const key = `login_attempts:${email}:${ip}`;
    const attempts = await this.redisService.incr(key);
    
    if (attempts === 1) {
      await this.redisService.expire(key, this.LOGIN_ATTEMPT_WINDOW);
    }

    if (attempts > this.MAX_LOGIN_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }
}
