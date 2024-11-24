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
import { LoginUserDto, SignupUserDto } from './dto';
import { User } from 'src/user/entities/user.entity';
import { RedisService } from 'src/shared/redis/redis.module';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtHelper: JwtHelperService,
    private readonly redisService: RedisService,
  ) {}

  async signup(createAuthDto: SignupUserDto): Promise<any> {
    this.logger.log('Run signup');
    const user = await this.userService.create(createAuthDto);
    if (!user) {
      this.logger.error('Failed to create user');
      throw new InternalServerErrorException('Unable to create user');
    }

    const tokens = await this.generateTokensAndSaveRefreshToken(user);
    return { ...user, tokens };
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    this.logger.log('Run login');
    const { email, password } = loginUserDto;

    const user = await this.userService.validateUser(email);
    if (!user || !this.userService.comparePassword(password, user.password)) {
      this.logger.warn('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    delete user.password;
    await this.userService.updateLastlogin(user.id);

    const tokens = await this.generateTokensAndSaveRefreshToken(user);
    return { ...user, tokens };
  }

  async logout(user: User): Promise<boolean> {
    this.logger.log('Run logout');
    await this.redisService.del(`refreshToken:${user.id}`);
    return true;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    this.logger.log('Run refresh token');

    // Validate refresh token
    const { id } = this.jwtHelper.verifyRefreshToken(refreshToken);
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
    return { tokens };
  }

  private parseExpirationTime(expiration: string): number {
    const timeValue = parseInt(expiration.slice(0, -1), 10);
    const timeUnit = expiration.slice(-1);

    switch (timeUnit) {
      case 'd':
        return timeValue * 24 * 60 * 60; // Convertir días a segundos
      case 'h':
        return timeValue * 60 * 60; // Convertir horas a segundos
      case 'm':
        return timeValue * 60; // Convertir minutos a segundos
      case 's':
        return timeValue; // Segundos
      default:
        throw new Error(`Formato de expiración no válido: ${expiration}`);
    }
  }

  private async generateTokensAndSaveRefreshToken(user: User) {
    const accessToken = this.jwtHelper.generateAccessToken({ id: user.id });
    const refreshToken = this.jwtHelper.generateRefreshToken({ id: user.id });

    // Parsear el tiempo de expiración en segundos
    const refreshTokenExpirationString = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION_TIME',
    );
    const refreshTokenExpiration = this.parseExpirationTime(
      refreshTokenExpirationString,
    );

    // Guardar el token en Redis con TTL
    await this.redisService.set(
      `refreshToken:${user.id}`,
      refreshToken,
      refreshTokenExpiration,
    );

    return { accessToken, refreshToken };
  }
}
