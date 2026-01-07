import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { FilterUserDto } from 'src/auth/dto/filter-user.dto';
import { PaginationParams } from 'src/pagination/interfaces/PaginationParams';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { UserPaginatedResponse } from './interfaces/user-paginated-response.graphql';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async getUserById(@Args('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Query(() => User, { nullable: true })
  async getUserByEmail(@Args('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Query(() => UserPaginatedResponse)
  async filterUsers(
    @Args('filters', { type: () => FilterUserDto })
    filters: FilterUserDto,
  ): Promise<UserPaginatedResponse> {
    return this.userService.filterUsers(filters);
  }

  @Mutation(() => Boolean)
  async updateLastLogin(@Args('id') id: string): Promise<boolean> {
    await this.userService.updateLastLogin(id);
    return true;
  }
}
