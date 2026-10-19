import { Controller, Get, HttpStatus, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
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
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiDoc(userEndpoints, 'filterUsers')
  @ApiOperation({ summary: 'List users with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
  async filterUsers(@Query() filters: FilterUserDto): Promise<PaginatedResponse<User>> {
    return this.userService.filterUsers(filters);
  }

  @Get('business')
  @Auth('', [])
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiDoc(userEndpoints, 'filterUsersByBusiness')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'List users scoped to a business (BusinessProfile)' })
  @ApiResponse({ status: 200, description: 'Paginated users for the business' })
  @ApiResponse({ status: 400, description: 'businessProfileId required for admin or manager' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions or invalid profile' })
  async filterUsersByBusiness(
    @Query() filters: FilterBusinessUsersDto,
    @GetUser() user: User,
  ): Promise<PaginatedResponse<User>> {
    return this.userService.filterUsersByBusiness(filters, user.id);
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
