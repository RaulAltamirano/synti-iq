import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Query,
  ClassSerializerInterceptor,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreFilterDto } from './dto/filter-store-dto';
import { AssignCashierDto } from './dto/assign-cashier.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { Auth } from 'src/auth/decorator/auth-decorator';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { SystemRole } from 'src/shared/enums/roles.enum';

@ApiTags('store')
@Controller('store')
@UseInterceptors(ClassSerializerInterceptor)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @Auth('', [])
  async findAll(
    @Query() filters: StoreFilterDto,
    @GetUser('sub') userId?: string,
  ): Promise<PaginatedResponse<Store>> {
    return this.storeService.findAll(filters, userId);
  }

  @Get(':id')
  @Auth('', [])
  async findOne(@Param('id') id: string, @GetUser('sub') userId?: string): Promise<Store> {
    return this.storeService.findOne(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth(SystemRole.BUSINESS_OWNER, [])
  @ApiOperation({
    summary: 'Create store',
    description:
      'Create a new store. Optionally include opening schedules (one per day). Schedules are only created via this endpoint.',
  })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Store created.', type: Store })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid body (e.g. duplicate dayOfWeek, openTime >= closeTime).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A store with this name already exists for this business.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only business owners can create stores.',
  })
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @GetUser('sub') userId: string,
  ): Promise<Store> {
    return this.storeService.create(createStoreDto, userId);
  }

  @Delete(':id')
  @Auth('', [])
  async remove(@Param('id') id: string, @GetUser('sub') userId: string): Promise<void> {
    await this.storeService.remove(id, userId);
  }

  @Post(':id/cashiers')
  @Auth('', [])
  async assignCashier(
    @Param('id') storeId: string,
    @Body() assignCashierDto: AssignCashierDto,
    @GetUser('sub') userId: string,
  ): Promise<boolean> {
    return this.storeService.assignCashierToStore(storeId, assignCashierDto.cashierId, userId);
  }

  @Get(':id/cashiers')
  @Auth('', [])
  async getCashiers(@Param('id') storeId: string, @GetUser('sub') userId: string) {
    return this.storeService.getCashiersFromStore(storeId, userId);
  }
}
