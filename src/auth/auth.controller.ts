import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  Delete,
  Param,
  UnauthorizedException,
  Query,
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
import { SessionFilterDto } from './dto/session-filter.dto';

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
  async signUp(
    @Body() dto: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signUp(dto, req);
    this.setAuthCookies(res, result.tokens);
    return {
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(201)
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, req);
    this.setAuthCookies(res, result.tokens);
    return {
      user: result.user,
    };
  }
  @Auth()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.access_token;

    await this.authService.logout(userId, token);
    this.clearAuthCookies(res);

    return null;
  }
  @Post('refresh')
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

    return null;
  }
  @Get('logout')
  @Auth([], [])
  async logoutWithoutGuard(@GetToken() accessToken: string, @GetUser() user: User) {
    return this.authService.logout(user.id, accessToken);
  }
  @Auth()
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.getProfile(token);
  }
  @Auth()
  @Get('sessions')
  async getActiveSessions(@Req() req: Request, @Query() filters: SessionFilterDto) {
    const userId = req.user['sub'];
    return this.authService.getActiveSessions(userId, filters);
  }
  @Auth()
  @Delete('sessions/:sessionId')
  async deleteDeviceSession(@Req() req: Request, @Param('sessionId') sessionId: string) {
    const userId = req.user['sub'];
    return this.authService.deleteDeviceSession(userId, sessionId);
  }
  @Auth()
  @Delete('sessions')
  async closeAllSessions(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.authService.closeAllSessions(userId);
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
