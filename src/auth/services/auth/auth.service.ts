import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { JwtHelperService } from 'src/shared/jwt-helper/jwt-helper.service';
import { LoginUserDto, SignupUserDto } from '../../dto';
import { User } from 'src/user/entities/user.entity';
import { RedisService } from 'src/shared/redis/redis.service';
import { PasswordService } from '../password/password.service';
import { UserSession } from 'src/auth/interfaces/user-session';
import { TokenResponse } from 'src/auth/interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtHelperService: JwtHelperService,
    private readonly redisService: RedisService,
    private readonly passwordService: PasswordService,
  ) {}

  async signup(createAuthDto: SignupUserDto): Promise<any> {
    this.logger.log('Run signup');
    const user = await this.userService.create(createAuthDto);
    if (!user) {
      this.logger.error('Failed to create user');
      throw new InternalServerErrorException('Unable to create user');
    }

    const tokens = await this.generateTokensAndSaveRefreshToken(user);
    this.userService.saveRefreshToken(user.id, tokens.refreshToken);
    return { ...user, tokens };
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    this.logger.log('Run login');
    const { email, password } = loginUserDto;
    const user = await this.userService.validateUser(email);
    const comparePassword = await this.passwordService.verify(
      password,
      user.password,
      email,
    );
    console.log(comparePassword);
    if (!user || !comparePassword) {
      this.logger.warn('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    delete user.password;
    await this.userService.updateLastlogin(user.id);

    const tokens = await this.generateTokensAndSaveRefreshToken(user);
    this.userService.saveRefreshToken(user.id, tokens.refreshToken);

    return { ...user, tokens };
  }
  // async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
  //   const { email, password, totpToken } = loginUserDto;

  //   // Rate limiting check
  //   const canProceed = await this.rateLimiter.checkRateLimit(email, 'login');
  //   if (!canProceed) {
  //     throw new TooManyRequestsException('Too many login attempts');
  //   }

  //   const user = await this.userService.validateUser(email, password);

  //   // 2FA check if enabled
  //   if (user.twoFactorEnabled) {
  //     if (
  //       !totpToken ||
  //       !(await this.twoFactorService.verify(user, totpToken))
  //     ) {
  //       throw new UnauthorizedException('Invalid 2FA token');
  //     }
  //   }
  // }

  async getProfile(user: User): Promise<any> {
    this.logger.log('Run get profile');
    const objUser = await this.userService.finById(user.id);
    const tokens = await this.generateTokensAndSaveRefreshToken(user);
    return {
      ...objUser,
      tokens: tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    this.logger.log('Run refresh token');

    const { id } = this.jwtHelperService.verifyRefreshToken(refreshToken);
    const storedToken = await this.redisService.get(`refreshToken:${id}`);
    if (storedToken !== refreshToken) {
      this.logger.warn('Invalid or revoked refresh token');
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.finById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tokens = await this.generateTokensAndSaveRefreshToken(user);
    return tokens;
  }

  async logout(user: User): Promise<boolean> {
    this.logger.log('Run logout');
    await this.userService.clearRefreshToken(user);
    await this.redisService.del(`refreshToken:${user.id}`);
    return true;
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
}
