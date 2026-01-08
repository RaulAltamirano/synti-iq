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

import { User } from 'src/user/entities/user.entity';
import { Auth, GetUser } from './decorator';
import { GetToken } from 'src/auth/decorator/token.decorator';
import { LoginUserDto, TokensUserDto } from 'src/auth/dto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseHelper } from './helpers/token-response.helper';

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
      ...TokenResponseHelper.build(result.tokens),
    };
  }

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
      ...TokenResponseHelper.build(result.tokens),
    };
  }
  @Auth('', [])
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.access_token;

    await this.authService.logout(userId, token);
    this.clearAuthCookies(res);

    return {
      message: 'Successfully logged out',
    };
  }
  @Post('refresh')
  @HttpCode(200)
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokens = await this.authService.refreshTokens({ refreshToken }, req);
    this.setAuthCookies(res, tokens);
    return TokenResponseHelper.build(tokens);
  }
  @Get('logout')
  @Auth('', [])
  async logoutWithoutGuard(@GetToken() accessToken: string, @GetUser() user: User) {
    return this.authService.logout(user.id, accessToken);
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
