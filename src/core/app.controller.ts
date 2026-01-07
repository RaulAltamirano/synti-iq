import { Controller, Delete, Get, HttpCode, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from 'src/auth/decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test-endpoint-auth')
  @Auth([], [])
  getAuth(): string {
    return this.appService.getMethodAuth();
  }
  @Get('test-endpoint')
  get(): string {
    return this.appService.getMethod();
  }
  @Post('test-endpoint')
  post(): string {
    return this.appService.postMethod();
  }
  @Put('test-endpoint')
  put(): string {
    return this.appService.putMethod();
  }
  @Delete('test-endpoint')
  @HttpCode(204)
  delete() {}
}
