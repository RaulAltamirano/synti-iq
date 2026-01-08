import { Controller, Get, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { Auth, GetUser } from 'src/auth/decorator';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async filterUsers(@Query() filters: FilterUserDto): Promise<PaginatedResponse<User>> {
    return this.userService.filterUsers(filters);
  }

  @Get('me')
  @Auth('', [])
  @ApiBearerAuth()
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
  async getMyProfile(@GetUser() user: User): Promise<any> {
    return this.userService.getMyProfile(user.id);
  }
}
