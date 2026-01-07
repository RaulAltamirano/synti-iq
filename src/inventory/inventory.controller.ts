import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('movements')
  @ApiOperation({ summary: 'Create a new inventory movement' })
  @ApiResponse({
    status: 201,
    description: 'The inventory movement has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async createMovement(@Body() createInventoryDto: CreateInventoryDto) {
    try {
      return await this.inventoryService.createMovement(createInventoryDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error processing inventory movement',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('products/:id/stock')
  @ApiOperation({ summary: 'Get current stock for a specific product' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the current stock level for the product.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async getProductStock(@Param('id') id: string) {
    try {
      const stock = await this.inventoryService.getProductStock(id);
      return { stock };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error retrieving product stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('products/:id/movements')
  @ApiOperation({ summary: 'Get movement history for a specific product' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the paginated movement history for the product.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async getProductMovements(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return await this.inventoryService.getProductMovements(id, page, limit);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error retrieving product movements',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('products/low-stock')
  @ApiOperation({ summary: 'Get products with stock below threshold' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: 'number',
    description: 'Minimum stock threshold (default: 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of products with stock below the threshold.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async getLowStockProducts(@Query('threshold') threshold: number = 0) {
    try {
      return await this.inventoryService.getLowStockProducts(threshold);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error retrieving low stock products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
