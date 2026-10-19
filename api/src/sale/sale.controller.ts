import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Auth } from 'src/auth/decorator';
import { Permission } from 'src/shared/enums/permissions.enum';

@ApiTags('Sale')
@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @Auth('', [Permission.PROCESS_SALES])
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiBody({ type: CreateSaleDto })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid sale data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Get()
  @Auth('', [Permission.VIEW_RECENT_RECEIPTS])
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get all sales' })
  @ApiResponse({ status: 200, description: 'List of sales' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.saleService.findAll();
  }

  @Get(':id')
  @Auth('', [Permission.VIEW_RECENT_RECEIPTS])
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get a sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({ status: 200, description: 'Sale details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(+id);
  }

  @Patch(':id')
  @Auth('', [Permission.VOID_TRANSACTIONS, Permission.PROCESS_REFUNDS, Permission.APPLY_DISCOUNTS])
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update a sale' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiBody({ type: UpdateSaleDto })
  @ApiResponse({ status: 200, description: 'Sale updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  @Auth('', [Permission.VOID_TRANSACTIONS])
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Delete a sale' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({ status: 200, description: 'Sale deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  remove(@Param('id') id: string) {
    return this.saleService.remove(+id);
  }
}
