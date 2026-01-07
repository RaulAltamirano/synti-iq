import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategorieService } from './product-categorie.service';
import { ProductCategorieController } from './product-categorie.controller';
import { ProductCategorie } from './entities/product-categorie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategorie])],
  controllers: [ProductCategorieController],
  providers: [ProductCategorieService],
  exports: [ProductCategorieService],
})
export class ProductCategorieModule {}
