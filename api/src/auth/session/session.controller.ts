import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorator';
import { SessionService } from './session.service';
import { FilterUserSessionDto } from 'src/user-session/dto/filter-user-session.dto';
import { ApiDoc } from 'src/shared/decorators';
import { sessionEndpoints } from 'src/docs/session.endpoints';

@ApiTags('Sessions')
@ApiCookieAuth('access_token')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiDoc(sessionEndpoints, 'listSessions')
  @Auth('', [])
  @Get()
  async list(@GetUser('sub') userId: string, @Query() filters: FilterUserSessionDto) {
    return this.sessionService.listActive(userId, filters);
  }

  @ApiDoc(sessionEndpoints, 'deleteSession')
  @Auth('', [])
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(@GetUser('sub') userId: string, @Param('id') sessionId: string): Promise<void> {
    await this.sessionService.invalidateOne(userId, sessionId);
  }

  @ApiDoc(sessionEndpoints, 'deleteAllSessions')
  @Auth('', [])
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll(@GetUser('sub') userId: string): Promise<void> {
    await this.sessionService.invalidateAll(userId);
  }
}
