import { Controller, Post, Body, Get, Req } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { Auth, GetUser } from '../../decorator';
import { LoginUserDto } from '../../dto';
import { CreateUserDto } from 'src/user/dtos/CreateUserDto';
import { GetToken } from 'src/auth/decorator/token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Req() request: Request, @Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto, request);
  }
  @Post('login')
  login(@Req() request: Request, @Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto, request);
  }
  @Post('refresh-token')
  refreshToken(@Body('refreshToken') refreshToken: string): Promise<any> {
    return this.authService.refreshTokens(refreshToken);
  }
  @Get('logout')
  @Auth([], [])
  async logout(@GetToken() accessToken: string, @GetUser() user: User) {
    return this.authService.logout(user.id, accessToken);
  }
  @Get('me')
  @Auth([], [])
  getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user);
  }
}
