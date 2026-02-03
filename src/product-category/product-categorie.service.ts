import { Injectable } from '@nestjs/common';
import { CreateProductCategorieDto } from './dto/create-product-categorie.dto';
import { UpdateProductCategorieDto } from './dto/update-product-categorie.dto';

@Injectable()
export class ProductCategorieService {
  create(createProductCategorieDto: CreateProductCategorieDto) {
    return 'This action adds a new productCategorie';
  }

  findAll() {
    return `This action returns all productCategorie`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productCategorie`;
  }

  update(id: number, updateProductCategorieDto: UpdateProductCategorieDto) {
    return `This action updates a #${id} productCategorie`;
  }

  remove(id: number) {
    return `This action removes a #${id} productCategorie`;
  }
}
