import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from './decorator';
import { LoginUserDto, TokensUserDto } from 'src/auth/dto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { RegisterBusinessDto } from './dto/register-business.dto';
import { TokenResponseHelper } from './helpers/token-response.helper';
import { ApiDoc } from 'src/shared/decorators';
import { authEndpoints } from 'src/docs/auth.endpoints';
import { VerifyTotpDto } from './dto/verify-totp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly cookieOptions = {
    httpOnly: true,
    secure: this.isProduction,
    sameSite: 'strict' as const,
    path: '/',
  };

  constructor(private readonly authService: AuthService) {}

  @ApiDoc(authEndpoints, 'signup')
  @Post('signup')
  @HttpCode(201)
  async signUp(
    @Body() dto: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signUp(dto, req);
    this.setAuthCookies(res, result.tokens);
    res.setHeader('Location', `/api/user/me`);
    return {
      message: 'User registered successfully',
      user: result.user,
      ...TokenResponseHelper.build(result.tokens, result.sessionId),
    };
  }

  @ApiDoc(authEndpoints, 'registerBusiness')
  @Post('register-business')
  @HttpCode(201)
  async registerBusiness(
    @Body() dto: RegisterBusinessDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerBusiness(dto, req);
    this.setAuthCookies(res, result.tokens);
    res.setHeader('Location', `/api/user/me`);
    return {
      message: 'Business account registered successfully',
      user: result.user,
      ...TokenResponseHelper.build(result.tokens, result.sessionId),
    };
  }

  @ApiDoc(authEndpoints, 'login')
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, req);
    this.setAuthCookies(res, result.tokens);
    return {
      user: result.user,
      ...TokenResponseHelper.build(result.tokens, result.sessionId),
    };
  }
  @ApiDoc(authEndpoints, 'logout')
  @Auth('', [])
  @Post('logout')
  @HttpCode(200)
  async logout(
    @GetUser('sub') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = req.cookies?.access_token ?? '';

    await this.authService.logout(userId, accessToken);
    this.clearAuthCookies(res);

    return { message: 'Successfully logged out' };
  }

  @ApiDoc(authEndpoints, 'auth2faSetup')
  @Auth('', [])
  @Post('2fa/setup')
  @HttpCode(200)
  async setup2fa(@GetUser('sub') userId: string) {
    return this.authService.setup2fa(userId);
  }

  @ApiDoc(authEndpoints, 'auth2faVerify')
  @Auth('', [])
  @Post('2fa/verify')
  @HttpCode(200)
  async verify2fa(@GetUser('sub') userId: string, @Body() dto: VerifyTotpDto) {
    const result = await this.authService.verify2fa(userId, dto.code);
    return { backupCodes: result.backupCodes };
  }

  @ApiDoc(authEndpoints, 'auth2faDisable')
  @Auth('', [])
  @Post('2fa/disable')
  @HttpCode(200)
  async disable2fa(@GetUser('sub') userId: string, @Body() dto: VerifyTotpDto) {
    await this.authService.disable2fa(userId, dto.code);
    return { message: '2FA disabled successfully' };
  }

  @ApiDoc(authEndpoints, 'auth2faStatus')
  @Auth('', [])
  @Get('2fa/status')
  async get2faStatus(@GetUser('sub') userId: string) {
    return this.authService.get2faStatus(userId);
  }

  @ApiDoc(authEndpoints, 'auth2faRegenerateBackupCodes')
  @Auth('', [])
  @Post('2fa/regenerate-backup-codes')
  @HttpCode(200)
  async regenerateBackupCodes(@GetUser('sub') userId: string) {
    const backupCodes = await this.authService.regenerateBackupCodes(userId);
    return { backupCodes };
  }

  @ApiDoc(authEndpoints, 'refresh')
  @Post('refresh')
  @HttpCode(200)
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const result = await this.authService.refreshTokens({ refreshToken }, req);
    this.setAuthCookies(res, result.tokens);
    return TokenResponseHelper.build(result.tokens, result.sessionId);
  }

  private setAuthCookies(res: Response, tokens: TokensUserDto): void {
    res.cookie('access_token', tokens.token.token, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken.token, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', this.cookieOptions);
    res.clearCookie('refresh_token', this.cookieOptions);
  }
}
