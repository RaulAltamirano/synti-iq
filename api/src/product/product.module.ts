import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Product } from './entities/product.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductCategorie } from 'src/product-category/entities/product-categorie.entity';
import { ProductCategorieModule } from 'src/product-category/product-categorie.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { CacheService } from 'src/cache/cache.service';
import { StoreModule } from 'src/store/store.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService, CacheService],
  imports: [
    ProductCategorieModule,
    InventoryModule,
    StoreModule,
    TypeOrmModule.forFeature([Inventory, Product, ProductCategorie]),
    CacheModule.register(),
  ],
  exports: [TypeOrmModule, ProductService],
})
export class ProductModule {}
