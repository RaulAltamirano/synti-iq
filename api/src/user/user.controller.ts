import { Controller, Get, HttpStatus, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FilterBusinessUsersDto } from './dto/filter-business-users.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { Auth, GetUser } from 'src/auth/decorator';
import { User } from './entities/user.entity';
import { UserProfileResponse } from './interfaces/user-profile-response.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { ApiDoc } from 'src/shared/decorators';
import { userEndpoints } from 'src/docs/user.endpoints';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth('', [])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiDoc(userEndpoints, 'filterUsers')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'List users in the caller business' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
  async filterUsers(
    @Query() filters: FilterBusinessUsersDto,
    @GetUser('sub') userId: string,
  ): Promise<PaginatedResponse<User>> {
    return this.userService.filterUsersByBusiness(filters, userId);
  }

  @Get('me')
  @Auth('', [])
  @ApiDoc(userEndpoints, 'getMyProfile')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found or inactive',
  })
  async getMyProfile(@GetUser() user: User): Promise<UserProfileResponse> {
    return this.userService.getMyProfile(user.id);
  }
}
