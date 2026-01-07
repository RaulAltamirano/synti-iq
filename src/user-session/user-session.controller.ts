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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserSessionService } from './user-session.service';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { FilterUserSessionDto } from './dto/filter-user-session.dto';
import { UserSessionResponseDto } from './dto/user-session-response.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@ApiTags('User Session')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-session')
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The session has been successfully created',
    type: UserSessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createSession(
    @Body() createSessionDto: CreateUserSessionDto,
  ): Promise<UserSessionResponseDto> {
    return this.userSessionService.createSession(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get active sessions for the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated list of active sessions',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResponse' },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserSessionResponseDto' },
            },
          },
        },
      ],
    },
  })
  async getActiveSessions(
    @GetUser('id') userId: string,
    @Query() filters: FilterUserSessionDto,
  ): Promise<PaginatedResponse<UserSessionResponseDto>> {
    return this.userSessionService.getActiveSessions(userId, filters);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get active devices summary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns summary of active devices with session counts',
  })
  async getActiveDevices(@GetUser('id') userId: string) {
    return this.userSessionService.getActiveDevices(userId);
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invalidate a specific session' })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session to invalidate',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Session has been successfully invalidated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async invalidateSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.userSessionService.invalidateSession(userId, sessionId);
  }

  @Delete('devices/:deviceType')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Invalidate all sessions for a specific device type',
  })
  @ApiParam({
    name: 'deviceType',
    description: 'Type of device (mobile, tablet, desktop)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All sessions for the device type have been invalidated',
  })
  async invalidateDeviceSessions(
    @GetUser('id') userId: string,
    @Param('deviceType') deviceType: string,
  ): Promise<void> {
    await this.userSessionService.invalidateDeviceSessions(userId, deviceType);
  }

  @Delete('current/:sessionId/others')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invalidate all sessions except the current one' })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the current session to keep active',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All other sessions have been invalidated',
  })
  async invalidateOtherSessions(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.userSessionService.invalidateOtherSessions(userId, sessionId);
  }

  @Delete('all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invalidate all sessions for the current user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All sessions have been invalidated',
  })
  async invalidateAllSessions(@GetUser('id') userId: string): Promise<void> {
    await this.userSessionService.invalidateAllSessions(userId);
  }

  @Post(':sessionId/validate')
  @ApiOperation({ summary: 'Validate session ownership' })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session to validate',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns whether the session is valid',
    type: Boolean,
  })
  async validateSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<boolean> {
    return this.userSessionService.validateSessionOwnership(userId, sessionId);
  }

  @Post(':sessionId/last-used')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update session last used timestamp' })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session to update',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Session last used timestamp has been updated',
  })
  async updateSessionLastUsed(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.userSessionService.updateSessionLastUsed(userId, sessionId);
  }
}
