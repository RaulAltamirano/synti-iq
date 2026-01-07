import { Controller, Get, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
import { UserPaginatedResponse } from './interfaces/user-paginated-response.graphql';
import { UpdateUserDto } from './dtos/UpdateUserDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async filterUsers(@Query() filters: FilterUserDto): Promise<UserPaginatedResponse> {
    return this.userService.filterUsers(filters);
  }
}
