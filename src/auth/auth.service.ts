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
import { TokenFactory } from 'src/auth/factory/token-factory';
import { UserSessionService } from 'src/user-session/user-session.service';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { LoginUserDto, TokensUserDto } from 'src/auth/dto';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';
import { CreateUserSessionDto } from 'src/user-session/dto/create-user-session.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserService,
    private readonly sessionRepository: UserSessionService,
    private readonly tokenFactory: TokenFactory,
    private readonly passwordService: PasswordService,
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

    await this.userRepository.updateLastLogin(user.id);

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
    return {
      userAgent: request?.headers['user-agent'] || null,
      ipAddress:
        request?.headers['x-forwarded-for']?.toString().split(',')[0] || null,
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
}
