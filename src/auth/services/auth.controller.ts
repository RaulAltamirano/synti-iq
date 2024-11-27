import { Controller, Post, Body, Get } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { Auth, GetUser } from '../decorator';
import { LoginUserDto, SignupUserDto } from '../dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Body() signupAuthDto: SignupUserDto) {
    return this.authService.signup(signupAuthDto);
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Post('refresh-token')
  refreshToken(@Body('refreshToken') refreshToken: string): Promise<any> {
    return this.authService.refreshToken(refreshToken);
  }
  @Get('logout')
  @Auth()
  logout(@GetUser() user: User) {
    return this.authService.logout(user);
  }
}
