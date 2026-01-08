import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Auth } from 'src/auth/decorator';
import { Permission } from 'src/shared/enums/permissions.enum';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @Auth('', [Permission.PROCESS_SALES])
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Get()
  @Auth('', [Permission.VIEW_RECENT_RECEIPTS])
  findAll() {
    return this.saleService.findAll();
  }

  @Get(':id')
  @Auth('', [Permission.VIEW_RECENT_RECEIPTS])
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(+id);
  }

  @Patch(':id')
  @Auth('', [Permission.VOID_TRANSACTIONS, Permission.PROCESS_REFUNDS, Permission.APPLY_DISCOUNTS])
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  @Auth('', [Permission.VOID_TRANSACTIONS])
  remove(@Param('id') id: string) {
    return this.saleService.remove(+id);
  }
}
