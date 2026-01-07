import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Product } from './entities/product.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductCategorie } from 'src/product-categorie/entities/product-categorie.entity';
import { ProductCategorieModule } from 'src/product-categorie/product-categorie.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { CacheService } from 'src/cache/cache.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, CacheService],
  imports: [
    ProductCategorieModule,
    InventoryModule,
    TypeOrmModule.forFeature([Inventory, Product, ProductCategorie]),
    CacheModule.register(),
  ],
  exports: [TypeOrmModule, ProductService],
})
export class ProductModule {}
