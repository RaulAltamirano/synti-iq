import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { StoreScheduleService } from './store-schedule.service';
import { CreateStoreScheduleDto } from './dto/create-store-schedule.dto';
import { UpdateStoreScheduleDto } from './dto/update-store-schedule.dto';
import { StoreSchedule } from './entities/store-schedule.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('store-schedule')
@Controller('store-schedule')
export class StoreScheduleController {
  constructor(private readonly storeScheduleService: StoreScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new store schedule' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The store schedule has been successfully created.',
    type: StoreSchedule,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A schedule already exists for this day.',
  })
  async create(@Body() createStoreScheduleInput: CreateStoreScheduleDto): Promise<StoreSchedule> {
    return this.storeScheduleService.create(createStoreScheduleInput);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store schedule by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The store schedule has been successfully retrieved.',
    type: StoreSchedule,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Store schedule not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<StoreSchedule> {
    try {
      Logger.debug(`Attempting to find store schedule with ID: ${id}`);
      const schedule = await this.storeScheduleService.findOne(id);
      Logger.debug(`Successfully found store schedule with ID: ${id}`);
      return schedule;
    } catch (error) {
      Logger.error(`Error finding store schedule with ID: ${id}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store schedule' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The store schedule has been successfully updated.',
    type: StoreSchedule,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Store schedule not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStoreScheduleInput: UpdateStoreScheduleDto,
  ): Promise<StoreSchedule> {
    return this.storeScheduleService.update(id, updateStoreScheduleInput);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a store schedule by setting isActive to false',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The store schedule has been successfully deactivated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Store schedule not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.storeScheduleService.remove(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle store schedule active status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The store schedule active status has been successfully toggled.',
    type: StoreSchedule,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Store schedule not found.',
  })
  async toggleActive(@Param('id', ParseUUIDPipe) id: string): Promise<StoreSchedule> {
    return this.storeScheduleService.toggleActive(id);
  }
}
