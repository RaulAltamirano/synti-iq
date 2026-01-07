import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Query,
  ClassSerializerInterceptor,
  Delete,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreFilterDto } from './dto/filter-store-dto';

@Controller('store')
@UseInterceptors(ClassSerializerInterceptor)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async findAll(@Query() filters: StoreFilterDto): Promise<any> {
    return this.storeService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Store> {
    return this.storeService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storeService.create(createStoreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.storeService.remove(id);
  }

  @Post(':id/cashiers')
  async assignCashier(
    @Param('id') storeId: string,
    @Body() assignCashierDto: any,
  ): Promise<boolean> {
    return this.storeService.assignCashierToStore(storeId, assignCashierDto.cashierId);
  }

  @Get(':id/cashiers')
  async getCashiers(@Param('id') storeId: string) {
    return this.storeService.getCashiersFromStore(storeId);
  }
}
