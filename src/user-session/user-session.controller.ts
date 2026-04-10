import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { UserSessionService } from './user-session.service';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { FilterUserSessionDto } from './dto/filter-user-session.dto';
import { UserSessionResponseDto } from './dto/user-session-response.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { ApiDoc } from 'src/shared/decorators';
import { userSessionEndpoints } from 'src/docs/user-session.endpoints';

@ApiTags('User Session')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('user-session')
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @ApiDoc(userSessionEndpoints, 'createSession')
  @Post()
  async createSession(
    @Body() createSessionDto: CreateUserSessionDto,
  ): Promise<UserSessionResponseDto> {
    return this.userSessionService.createSession(createSessionDto);
  }

  @ApiDoc(userSessionEndpoints, 'getActiveSessions')
  @Get()
  async getActiveSessions(
    @GetUser('id') userId: string,
    @Query() filters: FilterUserSessionDto,
  ): Promise<PaginatedResponse<UserSessionResponseDto>> {
    return this.userSessionService.getActiveSessions(userId, filters);
  }

  @ApiDoc(userSessionEndpoints, 'getActiveDevices')
  @Get('devices')
  async getActiveDevices(@GetUser('id') userId: string) {
    return this.userSessionService.getActiveDevices(userId);
  }

  @ApiDoc(userSessionEndpoints, 'invalidateSession')
  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async invalidateSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.userSessionService.invalidateSession(userId, sessionId);
  }

  @ApiDoc(userSessionEndpoints, 'invalidateDeviceSessions')
  @Delete('devices/:deviceType')
  @HttpCode(HttpStatus.NO_CONTENT)
  async invalidateDeviceSessions(
    @GetUser('id') userId: string,
    @Param('deviceType') deviceType: string,
  ): Promise<void> {
    await this.userSessionService.invalidateDeviceSessions(userId, deviceType);
  }

  @ApiDoc(userSessionEndpoints, 'invalidateOtherSessions')
  @Delete('current/:sessionId/others')
  @HttpCode(HttpStatus.NO_CONTENT)
  async invalidateOtherSessions(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.userSessionService.invalidateOtherSessions(userId, sessionId);
  }

  @ApiDoc(userSessionEndpoints, 'invalidateAllSessions')
  @Delete('all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async invalidateAllSessions(@GetUser('id') userId: string): Promise<void> {
    await this.userSessionService.invalidateAllSessions(userId);
  }

  @ApiDoc(userSessionEndpoints, 'validateSession')
  @Post(':sessionId/validate')
  async validateSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<boolean> {
    return this.userSessionService.validateSessionOwnership(userId, sessionId);
  }

  @ApiDoc(userSessionEndpoints, 'updateSessionLastUsed')
  @Post(':sessionId/last-used')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateSessionLastUsed(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    return this.userSessionService.updateSessionLastUsed(userId, sessionId);
  }
}
