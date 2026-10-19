import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductCategorieService } from './product-categorie.service';
import { CreateProductCategorieDto } from './dto/create-product-categorie.dto';
import { UpdateProductCategorieDto } from './dto/update-product-categorie.dto';

@Controller('product-categorie')
export class ProductCategorieController {
  constructor(private readonly productCategorieService: ProductCategorieService) {}

  @Post()
  create(@Body() createProductCategorieDto: CreateProductCategorieDto) {
    return this.productCategorieService.create(createProductCategorieDto);
  }

  @Get()
  findAll() {
    return this.productCategorieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productCategorieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductCategorieDto: UpdateProductCategorieDto) {
    return this.productCategorieService.update(+id, updateProductCategorieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productCategorieService.remove(+id);
  }
}
