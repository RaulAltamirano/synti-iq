import { Injectable } from '@nestjs/common';
import { CreateSaleItemDto } from './dto/create-sale-item.dto';
import { UpdateSaleItemDto } from './dto/update-sale-item.dto';

@Injectable()
export class SaleItemService {
  create(createSaleItemDto: CreateSaleItemDto) {
    return 'This action adds a new saleItem';
  }

  findAll() {
    return `This action returns all saleItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} saleItem`;
  }

  update(id: number, updateSaleItemDto: UpdateSaleItemDto) {
    return `This action updates a #${id} saleItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} saleItem`;
  }
}
