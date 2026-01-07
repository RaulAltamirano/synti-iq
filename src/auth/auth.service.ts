import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
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
import { isIP } from 'net';
import { SessionFilterDto } from './dto/session-filter.dto';
import { FilterUserSessionDto } from 'src/user-session/dto/filter-user-session.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { UserSessionResponseDto } from 'src/user-session/dto/user-session-response.dto';
import { UAParser } from 'ua-parser-js';
import { AnomalyDetectionService } from './services/anomaly-detection.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_WINDOW = 15 * 60;

  constructor(
    private readonly userRepository: UserService,
    private readonly sessionService: UserSessionService,
    private readonly tokenFactory: TokenFactory,
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly anomalyDetectionService: AnomalyDetectionService,
  ) {}

  async signUp(dto: SignUpDto, request?: Request): Promise<AuthResponseDto> {
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
    const metadata = this.extractSessionMetadata(request);
    await this.checkRateLimit(dto.email, metadata.deviceInfo?.ipAddress || 'unknown');

    const user = await this.userRepository.findByEmail(dto.email, {
      selectPassword: true,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isDelete) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive. Please contact support.');
    }

    const passwordValid = await this.passwordService.verify(dto.password, user.password, dto.email);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const key = `login_attempts:${dto.email}:${metadata.deviceInfo?.ipAddress || 'unknown'}`;
    await this.redisService.del(key);

    await this.userRepository.updateLastLogin(user.id);

    const tokens = await this.createUserSession({
      userId: user.id,
      deviceInfo: metadata.deviceInfo,
      lastUsed: metadata.lastUsed,
      sessionId: undefined,
      refreshToken: undefined,
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
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Sesión expirada o inválida');
      }
      throw error;
    }
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    const sessionId = this.extractSessionIdFromToken(accessToken, userId);
    if (!sessionId) {
      await this.sessionService.invalidateAllSessions(userId);
      return;
    }

    await this.sessionService.invalidateSession(userId, sessionId);
    await this.tokenFactory.deleteRefreshToken(userId, sessionId);
  }

  async refreshTokens(dto: RefreshTokenDto, request?: Request): Promise<TokensUserDto> {
    const { userId, sessionId } = await this.tokenFactory.verifyRefreshToken(dto.refreshToken);

    const isValidSession = await this.sessionService.validateSessionOwnership(userId, sessionId);
    if (!isValidSession) {
      throw new UnauthorizedException('Invalid session');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isDelete) {
      throw new UnauthorizedException('User account is no longer active');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    await this.sessionService.updateSessionLastUsed(userId, sessionId);

    // Detectar anomalías
    const metadata = this.extractSessionMetadata(request);
    const anomaly = await this.anomalyDetectionService.detectTokenReuse(userId, sessionId, {
      ipAddress: metadata.deviceInfo?.ipAddress,
      userAgent: metadata.deviceInfo?.userAgent,
      deviceInfo: metadata.deviceInfo,
    });

    if (anomaly.isAnomaly) {
      this.logger.warn(`Anomaly detected during token refresh: ${anomaly.reason}`, {
        userId,
        sessionId,
        severity: anomaly.severity,
      });

      if (anomaly.severity === 'high') {
        throw new UnauthorizedException('Security anomaly detected. Please login again.');
      }
    }

    await this.tokenFactory.invalidateRefreshToken(userId, sessionId, dto.refreshToken);
    const { tokens, refreshTokenHash } = await this.tokenFactory.generateTokens(user.id, sessionId);

    const sessionKey = `session:${userId}:${sessionId}`;
    const currentSession = await this.redisService.get<{
      refreshTokenHash: string;
      isValid: boolean;
      lastUsed?: string;
      deviceInfo?: any;
      usedTokens?: string[];
    }>(sessionKey);

    if (currentSession) {
      await this.sessionService.setSessionInRedisUnified(userId, sessionId, {
        refreshTokenHash,
        isValid: currentSession.isValid,
        lastUsed: new Date().toISOString(),
        deviceInfo: currentSession.deviceInfo,
        usedTokens: currentSession.usedTokens,
      });
    } else {
      const activeSessions = await this.sessionService.findActiveByUserId(userId);
      const dbSession = activeSessions.find(s => s.sessionId === sessionId);

      await this.sessionService.setSessionInRedisUnified(userId, sessionId, {
        refreshTokenHash,
        isValid: dbSession?.isValid ?? true,
        lastUsed: new Date().toISOString(),
        deviceInfo: dbSession?.deviceInfo ?? null,
      });
    }

    await this.anomalyDetectionService.recordTokenUsage(userId, sessionId, {
      ipAddress: metadata.deviceInfo?.ipAddress,
      userAgent: metadata.deviceInfo?.userAgent,
      deviceInfo: metadata.deviceInfo,
    });

    return tokens;
  }

  async getActiveSessions(
    userId: string,
    filters: SessionFilterDto,
  ): Promise<PaginatedResponse<UserSessionResponseDto>> {
    const filterDto: FilterUserSessionDto = {
      page: filters.page,
      limit: filters.limit,
      isValid: filters.isValid,
      lastUsedAfter: filters.lastUsedAfter,
      lastUsedBefore: filters.lastUsedBefore,
    };
    return this.sessionService.getActiveSessions(userId, filterDto);
  }

  async deleteDeviceSession(userId: string, sessionId: string): Promise<void> {
    await this.sessionService.invalidateSession(userId, sessionId);
  }

  async closeAllSessions(userId: string): Promise<void> {
    const activeSessions = await this.sessionService.findActiveByUserId(userId);
    await this.sessionService.invalidateAllSessions(userId);

    const sessionKeys = activeSessions.map(session => `session:${userId}:${session.sessionId}`);
    if (sessionKeys.length > 0) {
      await this.redisService.del(...sessionKeys);
    }
  }

  async validateUserAndSession(userId: string, sessionId?: string, tokenId?: string): Promise<any> {
    try {
      if (!userId) {
        throw new UnauthorizedException('User ID is required');
      }

      const user = await this.validateUser(userId);

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

  async validateToken(userId: string, tokenId: string): Promise<void> {
    try {
      const payload = this.tokenFactory.verifyAccessToken(tokenId);

      if (!payload || payload.sub !== userId) {
        throw new ForbiddenException('Token user ID mismatch');
      }

      if (!payload.sid) {
        throw new UnauthorizedException('Session ID missing in token');
      }

      await this.validateSession(userId, payload.sid);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Token validation failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private async validateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isDelete) {
      throw new UnauthorizedException('User account is no longer active');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  private async validateSession(userId: string, sessionId: string): Promise<void> {
    const isValid = await this.sessionService.validateSessionOwnership(userId, sessionId);
    if (!isValid) {
      this.logger.warn(`Session validation failed: userId=${userId}, sessionId=${sessionId}`);
      throw new UnauthorizedException('Invalid session');
    }

    await this.sessionService.updateSessionLastUsed(userId, sessionId);
  }

  private extractSessionMetadata(request?: Request): any {
    if (!request) {
      return {
        lastUsed: new Date(),
      };
    }

    const userAgent = request.headers['user-agent'];
    const forwardedFor = request.headers['x-forwarded-for']?.toString();
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    const uaParser = new UAParser(userAgent);
    const deviceInfo = {
      deviceType: this.determineDeviceType(uaParser.getDevice().type),
      deviceName: uaParser.getDevice().model || uaParser.getOS().name,
      browser: uaParser.getBrowser().name,
      browserVersion: uaParser.getBrowser().version,
      os: uaParser.getOS().name,
      osVersion: uaParser.getOS().version,
      userAgent: userAgent || null,
      ipAddress: isIP(ipAddress) ? ipAddress : null,
    };

    return {
      deviceInfo,
      lastUsed: new Date(),
    };
  }

  private determineDeviceType(deviceType: string | undefined): string {
    if (!deviceType) return 'desktop';

    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return 'mobile';
      case 'tablet':
        return 'tablet';
      default:
        return 'desktop';
    }
  }

  private extractSessionIdFromToken(accessToken: string, userId: string): string | null {
    try {
      const decoded = this.tokenFactory.verifyAccessToken(accessToken);
      if (decoded.sub !== userId) {
        throw new UnauthorizedException('Invalid token ownership');
      }
      return decoded.sid;
    } catch (error) {
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
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async createUserSession(dto: CreateUserSessionDto): Promise<TokensUserDto> {
    try {
      if (!dto.userId) {
        throw new BadRequestException('User ID is required');
      }

      const sessionId = this.tokenFactory.generateId();

      const { tokens, refreshTokenHash } = await this.tokenFactory.generateTokens(
        dto.userId,
        sessionId,
      );

      const createSessionDto: CreateUserSessionDto = {
        userId: dto.userId,
        refreshToken: refreshTokenHash,
        sessionId,
        deviceInfo: dto.deviceInfo,
        lastUsed: dto.lastUsed || new Date(),
      };

      await this.sessionService.createSession(createSessionDto);

      await this.sessionService.setSessionInRedisUnified(dto.userId, sessionId, {
        refreshTokenHash,
        isValid: true,
        lastUsed: (dto.lastUsed || new Date()).toISOString(),
        deviceInfo: dto.deviceInfo,
      });

      return tokens;
    } catch (error) {
      this.logger.error(
        `Error creating user session for user ${dto?.userId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user authentication session');
    }
  }
}
