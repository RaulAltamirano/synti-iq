import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
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
    private readonly jwtService: JwtHelperService,
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
    if (!user || !user.password) {
      this.logger.warn(`Login attempt failed: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

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

    return await this.createUserSession(user, request);
  }

  private async createUserSession(user: any, request?: Request) {
    const sessionId = randomUUID();
    const tokens = await this.generateTokensWithSession(user, sessionId);

    const { ipAddress, userAgent } = this.getClientMetadata(request);
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
      user: { id: user.id, email: user.email, isActive: user.isActive, tokens },
    };
  }

  private getClientMetadata(request?: Request) {
    return {
      ipAddress:
        request?.headers['x-forwarded-for']?.toString().split(',')[0] ||
        // request?.connection?.remoteAddress ||
        // request?.socket?.remoteAddress ||
        null,
      userAgent: request?.headers['user-agent'] || null,
    };
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
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new BadRequestException('Invalid refresh token format');
    }

    try {
      const { userId, sessionId } =
        await this.validateRefreshToken(refreshToken);
      const refreshTokenKey = `token:${userId}:${sessionId}:refresh`;

      await Promise.all([
        this.redisService.del(refreshTokenKey),
        this.redisService.del(`${refreshTokenKey}:jti`),
        this.userSessionService.updateSessionLastUsed(userId, sessionId),
      ]);

      const user = await this.userService.findById(userId);
      if (!user) {
        this.logger.warn(`User not found during token refresh: ${userId}`);
        throw new UnauthorizedException('User not found');
      }

      return await this.generateTokensWithSession(user, sessionId);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private async validateRefreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verifyRefreshToken(refreshToken);
      const { sub: userId, sid: sessionId } = decoded;
      if (!userId || !sessionId)
        throw new UnauthorizedException('Malformed token payload');

      const refreshTokenKey = `token:${userId}:${sessionId}:refresh`;
      const storedTokenHash = await this.redisService.get(refreshTokenKey);

      if (!storedTokenHash || typeof storedTokenHash !== 'string') {
        this.logger.warn(
          `Refresh attempt with non-existent token for user ${userId}, session ${sessionId}`,
        );
        throw new UnauthorizedException('Session expired or invalidated');
      }

      const isValidToken = await this.passwordService.compareHash(
        refreshToken,
        storedTokenHash,
      );

      if (!storedTokenHash) {
        this.logger.warn(
          `Refresh attempt with non-existent token for user ${userId}, session ${sessionId}`,
        );
        throw new UnauthorizedException('Session expired or invalidated');
      }
      if (!isValidToken) {
        this.logger.warn(
          `Token reuse detected for user ${userId}, session ${sessionId}`,
        );
        await this.invalidateSession(userId, sessionId);
        throw new UnauthorizedException('Token reuse detected');
      }

      return { userId, sessionId };
    } catch (error) {
      throw new UnauthorizedException('Expired or invalid refresh token');
    }
  }

  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    try {
      const refreshTokenKey = `refreshToken:${userId}:${sessionId}`;
      const deleted = await this.redisService.del(refreshTokenKey);

      await this.userSessionService.invalidateSession(userId, sessionId);

      const blacklistKey = `blacklist:session:${sessionId}`;
      await this.redisService.set(blacklistKey, 'invalidated', 86400);

      this.logger.log(
        `Session invalidated successfully: user=${userId}, session=${sessionId}, token deleted=${deleted}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate session: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to invalidate session');
    }
  }
  async getProfile(user: User): Promise<any> {
    this.logger.log('Run get profile');
    // const objUser = await this.userService.findById(user.id);
    // const tokens = await this.generateTokensAndSaveRefreshToken(user);
    // return {
    //   ...objUser,
    //   tokens: tokens,
    // };
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    if (!userId || !accessToken) {
      throw new BadRequestException('UserId and accessToken are required');
    }

    let sessionId: string | null = null;

    try {
      // Intentar verificar el token (puede lanzar error si está expirado)
      const decoded = this.jwtService.verifyAccessToken(accessToken);
      sessionId = decoded.sid;

      // Validar que el token pertenece al usuario correcto
      if (decoded.sub !== userId) {
        this.logger.warn(
          `Token user ID mismatch: token=${decoded.sub}, request=${userId}`,
        );
        throw new UnauthorizedException('Invalid token ownership');
      }
    } catch (jwtError) {
      this.logger.warn(`Token verification failed: ${jwtError.message}`);

      // Si el token está expirado, intentamos extraer el sessionId sin verificarlo
      const unverifiedDecoded = this.jwtService.decode(accessToken);
      if (
        unverifiedDecoded &&
        typeof unverifiedDecoded === 'object' &&
        unverifiedDecoded.sid
      ) {
        sessionId = unverifiedDecoded.sid;
        this.logger.log(
          `Using session ID from expired token for user ${userId}`,
        );
      }
    }

    if (!sessionId) {
      this.logger.warn(
        `Cannot extract session ID. Invalid or expired token for user ${userId}`,
      );
      await this.userSessionService.invalidateAllSessions(userId);
      return;
    }

    // Verificar si la sesión aún es válida
    const sessionExists =
      await this.userSessionService.validateSessionOwnership(userId, sessionId);
    if (!sessionExists) {
      this.logger.warn(
        `Session does not exist or was already invalidated: user=${userId}, session=${sessionId}`,
      );
      return;
    }

    // Invalidar la sesión
    this.logger.log(`Logging out user ${userId} with session ${sessionId}`);
    await this.invalidateSession(userId, sessionId);
  }

  private extractSessionId(accessToken: string, userId: string): string | null {
    try {
      const decoded = this.jwtService.verifyAccessToken(accessToken);
      if (decoded.sub !== userId) {
        this.logger.warn(
          `Token user ID mismatch: token=${decoded.sub}, request=${userId}`,
        );
        throw new UnauthorizedException('Invalid token ownership');
      }
      return decoded.sid;
    } catch (jwtError) {
      const unverifiedDecoded = this.jwtService.decode(accessToken);
      if (unverifiedDecoded?.sid && unverifiedDecoded.sub === userId) {
        this.logger.log(
          `Using session ID from expired token for user ${userId}`,
        );
        return unverifiedDecoded.sid;
      }
      return null;
    }
  }

  verifyAccessToken(token: string): any {
    try {
      const decoded = this.jwtService.verifyAccessToken(token);

      const sessionId = decoded.sid;
      const isBlacklisted = this.redisService.get(
        `blacklist:session:${sessionId}`,
      );

      if (isBlacklisted) {
        throw new UnauthorizedException('Session has been invalidated');
      }

      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid access token');
    }
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

  private async generateTokensWithSession(user: User, sessionId: string) {
    try {
      const basePayload = {
        sub: user.id,
        sid: sessionId,
        email: user.email,
      };

      const accessTokenExpirationString = this.configService.get<string>(
        'JWT_ACCESS_EXPIRATION_TIME',
      );
      const refreshTokenExpirationString = this.configService.get<string>(
        'JWT_REFRESH_EXPIRATION_TIME',
      );
      const accessTokenExpiration = this.parseExpirationTime(
        accessTokenExpirationString,
      );
      const refreshTokenExpiration = this.parseExpirationTime(
        refreshTokenExpirationString,
      );

      const [accessTokenJti, refreshTokenJti] = [randomUUID(), randomUUID()];

      const accessTokenPayload = { ...basePayload, jti: accessTokenJti };
      const refreshTokenPayload = { ...basePayload, jti: refreshTokenJti };

      const [accessToken, refreshToken] = [
        this.jwtService.generateAccessToken(accessTokenPayload),
        this.jwtService.generateRefreshToken(refreshTokenPayload),
      ];

      const refreshTokenHash = await this.passwordService.hash(refreshToken);

      const accessTokenKey = `token:${user.id}:${sessionId}:access:${accessTokenJti}`;
      const refreshTokenKey = `token:${user.id}:${sessionId}:refresh`;

      await Promise.all([
        this.redisService.set(accessTokenKey, 'valid', accessTokenExpiration),
        this.redisService.set(
          refreshTokenKey,
          refreshTokenHash,
          refreshTokenExpiration,
        ),
        this.redisService.set(
          `${refreshTokenKey}:jti`,
          refreshTokenJti,
          refreshTokenExpiration,
        ),
      ]);

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
