import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { ProductFilterDto } from './dto/product-filter-dto';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { CacheService } from 'src/cache/cache.service';
import { StoreQueryService } from 'src/store/services/store-query.service';

@Injectable()
export class ProductService {
  private readonly CACHE_PREFIX = 'products_list';
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private readonly cacheService: CacheService,
    private readonly storeQueryService: StoreQueryService,
  ) {}

  async findAll(filters: ProductFilterDto, userId: string): Promise<PaginatedResponse<Product>> {
    try {
      const storeIds = await this.storeQueryService.listInventoryStoreIds(userId);
      const cacheKey = PaginationCacheUtil.buildCacheKey(this.CACHE_PREFIX, {
        ...filters,
        storeIds: [...storeIds].sort(),
      });

      return await this.cacheService.get<PaginatedResponse<Product>>(
        cacheKey,
        async () => {
          const queryBuilder = this.productRepository.createQueryBuilder('product');
          if (storeIds.length > 0) {
            queryBuilder.leftJoinAndSelect(
              'product.inventoryItems',
              'inventoryItems',
              'inventoryItems.storeId IN (:...storeIds)',
              { storeIds },
            );
          }

          this.applyFilters(queryBuilder, filters);

          const countQueryBuilder = queryBuilder.clone();
          const total = await countQueryBuilder.getCount();

          PaginationCacheUtil.applyPagination(queryBuilder, filters);

          const products = await queryBuilder.getMany();

          return PaginationCacheUtil.createPaginatedResponse({
            items: products,
            total,
            page: filters.page,
            limit: filters.limit,
          });
        },
        { ttl: 300 }, // Mantener el mismo TTL de 300 segundos
      );
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<Product>, filters: ProductFilterDto): void {
    const {
      name,
      sku,
      barcode,
      brand,
      isActive,
      minPrice,
      maxPrice,
      minProfitMargin,
      isPerishable,
      salesRankMin,
      tags,
    } = filters;

    if (name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${name.trim()}%`,
      });
    }

    if (sku) {
      queryBuilder.andWhere('product.sku = :sku', { sku });
    }

    if (barcode) {
      queryBuilder.andWhere('product.barcode = :barcode', { barcode });
    }

    if (brand) {
      queryBuilder.andWhere('LOWER(product.brand) = LOWER(:brand)', {
        brand: brand.trim(),
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    if (isPerishable !== undefined) {
      queryBuilder.andWhere('product.isPerishable = :isPerishable', {
        isPerishable,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.sellingPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.sellingPrice <= :maxPrice', { maxPrice });
    }

    if (minProfitMargin !== undefined) {
      queryBuilder.andWhere('product.profitMargin >= :minProfitMargin', {
        minProfitMargin,
      });
    }

    if (salesRankMin !== undefined) {
      queryBuilder.andWhere('product.salesRank >= :salesRankMin', {
        salesRankMin,
      });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('product.tags && :tags', { tags });
    }
  }

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    await this.storeQueryService.findOne(createProductDto.storeId, userId);
    const existingProducts = await this.findBySkuOrBarcode(
      createProductDto.sku,
      createProductDto.barcode,
    );

    if (existingProducts.length > 0) {
      const duplicateSku = existingProducts.find(p => p.sku === createProductDto.sku);
      if (duplicateSku) {
        throw new ConflictException(`A product with SKU ${createProductDto.sku} already exists`);
      }

      if (createProductDto.barcode) {
        const duplicateBarcode = existingProducts.find(p => p.barcode === createProductDto.barcode);
        if (duplicateBarcode) {
          throw new ConflictException(
            `A product with barcode ${createProductDto.barcode} already exists`,
          );
        }
      }
    }

    if (createProductDto.profitMargin === undefined && createProductDto.purchasePrice > 0) {
      const profit = createProductDto.sellingPrice - createProductDto.purchasePrice;
      createProductDto.profitMargin = (profit / createProductDto.sellingPrice) * 100;
    }

    try {
      const product = this.productRepository.create(createProductDto);
      const savedProduct = await this.productRepository.save(product);

      const initialInventory = this.inventoryRepository.create({
        productId: savedProduct.id,
        storeId: createProductDto.storeId,
        quantity: 0, // Inicialmente el inventario está vacío
        availableQuantity: 0,
      });
      await this.inventoryRepository.save(initialInventory);

      return savedProduct;
    } catch (error) {
      throw new BadRequestException(`Error creating product: ${error.message}`);
    }
  }

  async findById(id: string, userId: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.inventoryItems = await this.inventoryForStores(
      id,
      await this.storeQueryService.listInventoryStoreIds(userId),
    );
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const existingProduct = await this.findById(id, userId);

    if (updateProductDto.sku || updateProductDto.barcode) {
      const sku = updateProductDto.sku || existingProduct.sku;
      const barcode = updateProductDto.barcode || existingProduct.barcode;

      const duplicates = await this.findBySkuOrBarcode(sku, barcode);

      const realDuplicates = duplicates.filter(p => p.id !== id);

      if (realDuplicates.length > 0) {
        if (updateProductDto.sku && realDuplicates.some(p => p.sku === sku)) {
          throw new ConflictException(`A product with SKU ${sku} already exists`);
        }

        if (updateProductDto.barcode && realDuplicates.some(p => p.barcode === barcode)) {
          throw new ConflictException(`A product with barcode ${barcode} already exists`);
        }
      }
    }

    if (
      (updateProductDto.purchasePrice !== undefined ||
        updateProductDto.sellingPrice !== undefined) &&
      updateProductDto.profitMargin === undefined
    ) {
      const purchasePrice =
        updateProductDto.purchasePrice !== undefined
          ? updateProductDto.purchasePrice
          : existingProduct.purchasePrice;

      const sellingPrice =
        updateProductDto.sellingPrice !== undefined
          ? updateProductDto.sellingPrice
          : existingProduct.sellingPrice;

      if (purchasePrice > 0) {
        const profit = sellingPrice - purchasePrice;
        updateProductDto.profitMargin = (profit / sellingPrice) * 100;
      }
    }

    try {
      const { storeId: _storeId, ...updatePayload } = updateProductDto;
      await this.productRepository.update(id, updatePayload as Partial<Product>);
      return this.findById(id, userId);
    } catch (error) {
      throw new BadRequestException(`Error updating product: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    await this.requireProduct(id);
    await this.productRepository.delete(id);
  }

  async softRemove(id: string, userId: string): Promise<Product> {
    const product = await this.requireProduct(id);

    product.isActive = false;
    const deactivatedProduct = await this.productRepository.save(product);

    if (!deactivatedProduct) {
      throw new BadRequestException(`Error deactivating product with ID ${id}`);
    }

    return this.findById(deactivatedProduct.id, userId);
  }

  private async requireProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  private async inventoryForStores(productId: string, storeIds: string[]): Promise<Inventory[]> {
    if (storeIds.length === 0) return [];
    return this.inventoryRepository.find({
      where: { productId, storeId: In(storeIds) },
    });
  }

  async findBySkuOrBarcode(sku: string, barcode?: string): Promise<Product[]> {
    try {
      if (!sku && !barcode) {
        throw new BadRequestException('Either SKU or barcode must be provided');
      }

      if (sku && typeof sku !== 'string') {
        throw new BadRequestException('SKU must be a string');
      }

      if (barcode && typeof barcode !== 'string') {
        throw new BadRequestException('Barcode must be a string');
      }

      const trimmedSku = sku?.trim();
      const trimmedBarcode = barcode?.trim();

      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .useIndex('idx_product_sku_barcode'); // Assuming you have this index

      const conditions = [];
      const parameters: Record<string, string> = {};

      if (trimmedSku) {
        conditions.push('product.sku = :sku');
        parameters.sku = trimmedSku;
      }

      if (trimmedBarcode) {
        conditions.push('product.barcode = :barcode');
        parameters.barcode = trimmedBarcode;
      }

      queryBuilder.where(conditions.join(' OR '), parameters);
      const results = await queryBuilder.getMany();
      return results;
    } catch (error) {
      Logger.error(`Error in findBySkuOrBarcode: ${error.message}`, error.stack, 'ProductService');

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(`Error searching for products: ${error.message}`);
    }
  }
}
