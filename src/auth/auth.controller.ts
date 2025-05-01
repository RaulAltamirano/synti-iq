import { Controller, Post, Body, Get, Req, Logger, Delete, Param, UnauthorizedException, Query } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { Auth, GetUser } from './decorator';
import { CreateUserDto } from 'src/user/dtos/CreateUserDto';
import { GetToken } from 'src/auth/decorator/token.decorator';
import { LoginUserDto } from 'src/auth/dto';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SessionFilterDto } from './dto/session-filter.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpDto, @Req() req: Request) {
    return this.authService.signUp(dto, req);
  }
  @Post('login')
  async login(@Body() dto: LoginUserDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }
  @Auth()
  @Post('logout')
  async logout(@Req() req: Request) {
    const userId = req.user['sub'];
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(userId, token);
  }
  @Auth()
  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
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
  async getActiveSessions(
    @Req() req: Request,
    @Query() filters: SessionFilterDto,
  ) {
    const userId = req.user['sub'];
    return this.authService.getActiveSessions(userId, filters);
  }
  @Auth()
  @Delete('sessions/:sessionId')
  async deleteDeviceSession(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
  ) {
    const userId = req.user['sub'];
    return this.authService.deleteDeviceSession(userId, sessionId);
  }
  @Auth()
  @Delete('sessions')
  async closeAllSessions(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.authService.closeAllSessions(userId);
  }
}
