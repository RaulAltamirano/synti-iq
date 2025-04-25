import { Controller, Post, Body, Get, Req, Logger } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { Auth, GetUser } from './decorator';
import { CreateUserDto } from 'src/user/dtos/CreateUserDto';
import { GetToken } from 'src/auth/decorator/token.decorator';
import { LoginUserDto } from 'src/auth/dto';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Req() request: Request, @Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto, request);
  }
  @Post('login')
  login(@Req() request: Request, @Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto, request);
  }
  @Post('refresh-token')
  // @Auth([], [])
  refreshToken(@Body('refreshToken') refreshToken: string): Promise<any> {
    return this.authService.refreshTokens({ refreshToken });
  }
  @Get('logout')
  @Auth([], [])
  async logout(@GetToken() accessToken: string, @GetUser() user: User) {
    return this.authService.logout(user.id, accessToken);
  }
  // @Post('create-cashier')
  // createCashier(@Req() request: Request, @Body() createUserDto: CreateUserDto) {
  //   return this.authService.signup(createUserDto, request);
  // }
  @Get('me')
  @Auth([], [])
  getProfile(@Req() req: Request) {
    return this.authService.getProfile(req.headers.authorization.split(' ')[1]);
  }
}
