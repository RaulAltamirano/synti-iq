import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { JwtHelperService } from 'src/shared/jwt-helper/jwt-helper.service';
import { LoginUserDto } from '../../dto';
import { User } from 'src/user/entities/user.entity';
import { RedisService } from 'src/shared/redis/redis.service';
import { PasswordService } from '../password/password.service';
import { CreateUserDto } from 'src/user/dtos/CreateUserDto';
import { randomUUID } from 'crypto';
import { UserSessionService } from 'src/user-session/user-session.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly userSessionService: UserSessionService,
    private readonly jwtHelperService: JwtHelperService,
    private readonly redisService: RedisService,
    private readonly passwordService: PasswordService,
  ) {}

  async signup(createUserDto: CreateUserDto, request?: Request): Promise<any> {
    this.logger.log('Run signup');
    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );

    const userToCreate = { ...createUserDto, password: hashedPassword };
    const user = await this.userService.create(userToCreate);
    if (!user) {
      this.logger.error('Failed to create user');
      throw new InternalServerErrorException('Unable to create user');
    }
    const sessionId = randomUUID();
    const tokens = await this.generateTokensWithSession(user, sessionId);
    const ipAddress = this.getClientIp(request);

    const hashedRefreshToken = await this.passwordService.hash(
      tokens.refreshToken,
    );

    await this.userSessionService.saveUserSession(user.id, {
      sessionId,
      refreshToken: hashedRefreshToken,
      userAgent: request?.headers['user-agent'],
      ipAddress: ipAddress || null,
      lastUsed: new Date(),
      isValid: true,
    });

    return {
      id: user.id,
      email: user.email,
      tokens,
    };
  }

  async login(loginUserDto: LoginUserDto, request?: Request): Promise<any> {
    this.logger.log('Run login');
    const { email, password } = loginUserDto;

    const user = await this.userService.findByEmail(email, {
      selectPassword: true,
    });

    if (!user) {
      this.logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      this.logger.error(`User found but password is missing: ${email}`);
      throw new InternalServerErrorException('Authentication error');
    }

    try {
      const isPasswordValid = await this.passwordService.verify(
        password,
        user.password,
        email,
      );

      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      await this.userService.updateLastLogin(user.id);

      const sessionId = randomUUID();

      const tokens = await this.generateTokensWithSession(user, sessionId);

      const ipAddress = this.getClientIp(request);
      const userAgent = request?.headers['user-agent'];

      const hashedRefreshToken = await this.passwordService.hash(
        tokens.refreshToken,
      );

      await this.userSessionService.saveUserSession(user.id, {
        sessionId,
        refreshToken: hashedRefreshToken,
        userAgent,
        ipAddress: ipAddress || null,
        lastUsed: new Date(),
        isValid: true,
      });

      delete user.password;

      return {
        user: {
          id: user.id,
          email: user.email,
          // role: user.role,
          isActive: user.isActive,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  private getClientIp(request?: Request): string | null {
    if (!request) return null;

    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',').shift() ||
      (request as any).socket?.remoteAddress ||
      null;

    return ip;
  }

  async refreshTokens(refreshToken: string): Promise<any> {
    try {
      const decoded = this.jwtHelperService.verifyRefreshToken(refreshToken);
      const { sub: userId, sid: sessionId } = decoded;

      const storedTokenHash = await this.redisService.get(
        `refreshToken:${userId}:${sessionId}`,
      );
      if (!storedTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValidToken = await this.passwordService.compareHash(
        refreshToken,
        storedTokenHash.toString(),
      );
      if (!isValidToken) {
        await this.invalidateSession(userId, sessionId);
        throw new UnauthorizedException('Token reuse detected');
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.redisService.del(`refreshToken:${userId}:${sessionId}`);

      const tokens = await this.generateTokensWithSession(user, sessionId);

      await this.userSessionService.updateSessionLastUsed(userId, sessionId);

      return tokens;
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    await this.redisService.del(`refreshToken:${userId}:${sessionId}`);
    await this.userSessionService.invalidateSession(userId, sessionId);
    this.logger.warn(
      `Token reuse detected for user ${userId}, session ${sessionId}`,
    );
  }

  async getProfile(user: User): Promise<any> {
    this.logger.log('Run get profile');
    const objUser = await this.userService.findById(user.id);
    const tokens = await this.generateTokensAndSaveRefreshToken(user);
    return {
      ...objUser,
      tokens: tokens,
    };
  }

  async logout(user: any, request: any): Promise<void> {
    // try {
    this.logger.log(user, request);
    // const decoded = this.jwtHelperService.verifyAccessToken(token);
    // const { sub: userId, sid: sessionId } = decoded;
    // await this.invalidateSession(userId, sessionId);
    // } catch (error) {
    //   this.logger.error(`Logout failed: ${error.message}`);
    //   throw new UnauthorizedException('Invalid token');
    // }
  }

  private parseExpirationTime(expiration: string): number {
    const timeValue = parseInt(expiration.slice(0, -1), 10);
    const timeUnit = expiration.slice(-1);

    switch (timeUnit) {
      case 'd':
        return timeValue * 24 * 60 * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'm':
        return timeValue * 60;
      case 's':
        return timeValue;
      default:
        throw new Error(`Formato de expiración no válido: ${expiration}`);
    }
  }

  private async generateTokensAndSaveRefreshToken(user: User) {
    const accessToken = this.jwtHelperService.generateAccessToken({
      id: user.id,
    });
    const refreshToken = this.jwtHelperService.generateRefreshToken({
      id: user.id,
    });

    const refreshTokenExpirationString = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION_TIME',
    );
    const refreshTokenExpiration = this.parseExpirationTime(
      refreshTokenExpirationString,
    );

    await this.redisService.set(
      `refreshToken:${user.id}`,
      refreshToken,
      refreshTokenExpiration,
    );

    return { accessToken, refreshToken };
  }
  private async generateTokensWithSession(user: User, sessionId: string) {
    try {
      const basePayload = {
        sub: user.id,
        sid: sessionId,
        email: user.email, 
      };

      const accessTokenJti = randomUUID();
      const accessTokenPayload = {
        ...basePayload,
        jti: accessTokenJti,
      };
      const accessToken =
        this.jwtHelperService.generateAccessToken(accessTokenPayload);

      const accessTokenKey = `accessToken:${user.id}:${sessionId}:${accessTokenJti}`;
      const accessTokenExpirationString = this.configService.get<string>(
        'JWT_ACCESS_EXPIRATION_TIME',
      );
      const accessTokenExpiration = this.parseExpirationTime(
        accessTokenExpirationString,
      );
      await this.redisService.set(
        accessTokenKey,
        'valid',
        accessTokenExpiration,
      );

      const refreshTokenJti = randomUUID();
      const refreshTokenPayload = {
        ...basePayload,
        jti: refreshTokenJti,
      };
      const refreshToken =
        this.jwtHelperService.generateRefreshToken(refreshTokenPayload);

      // Almacenar hash del refresh token en Redis
      const refreshTokenExpirationString = this.configService.get<string>(
        'JWT_REFRESH_EXPIRATION_TIME',
      );
      const refreshTokenExpiration = this.parseExpirationTime(
        refreshTokenExpirationString,
      );
      const refreshTokenHash = await this.passwordService.hash(refreshToken);

      await this.redisService.set(
        `refreshToken:${user.id}:${sessionId}:hash`,
        refreshTokenHash,
        refreshTokenExpiration,
      );

      await this.redisService.set(
        `refreshToken:${user.id}:${sessionId}:jti`,
        refreshTokenJti,
        refreshTokenExpiration,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        `Error generating tokens: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error generating authentication tokens',
      );
    }
  }
}
