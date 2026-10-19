import { PartialType } from '@nestjs/swagger';
import { CreateProductCategorieDto } from './create-product-categorie.dto';

export class UpdateProductCategorieDto extends PartialType(CreateProductCategorieDto) {}
