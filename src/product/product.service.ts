import { Injectable, ConflictException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { ProductFilterDto } from './dto/product-filter-dto';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class ProductService {
  private readonly CACHE_PREFIX = 'products_list';
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(filters: ProductFilterDto): Promise<PaginatedResponse<Product>> {
    try {
      const cacheKey = PaginationCacheUtil.buildCacheKey(this.CACHE_PREFIX, filters);

      return await this.cacheService.get<PaginatedResponse<Product>>(
        cacheKey,
        async () => {
          const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.inventoryItems', 'inventoryItems');

          this.applyFilters(queryBuilder, filters);

          const countQueryBuilder = queryBuilder.clone();
          const total = await countQueryBuilder.getCount();

          PaginationCacheUtil.applyPagination(queryBuilder, filters);

          const products = await queryBuilder.getMany();

          return PaginationCacheUtil.createPaginatedResponse({
            data: products,
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

  private applyFilters(queryBuilder: any, filters: ProductFilterDto): void {
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

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProducts = await this.findBySkuOrBarcode(
      createProductDto.sku,
      createProductDto.barcode,
    );

    if (existingProducts.length > 0) {
      const duplicateSku = existingProducts.find(p => p.sku === createProductDto.sku);
      if (duplicateSku) {
        throw new ConflictException(`Ya existe un producto con el SKU: ${createProductDto.sku}`);
      }

      if (createProductDto.barcode) {
        const duplicateBarcode = existingProducts.find(p => p.barcode === createProductDto.barcode);
        if (duplicateBarcode) {
          throw new ConflictException(
            `Ya existe un producto con el código de barras: ${createProductDto.barcode}`,
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
      throw new BadRequestException(`Error al crear el producto: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['inventoryItems'],
    });

    if (!product) {
      throw new BadRequestException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: any): Promise<Product> {
    const existingProduct = await this.findById(id);

    if (updateProductDto.sku || updateProductDto.barcode) {
      const sku = updateProductDto.sku || existingProduct.sku;
      const barcode = updateProductDto.barcode || existingProduct.barcode;

      const duplicates = await this.findBySkuOrBarcode(sku, barcode);

      const realDuplicates = duplicates.filter(p => p.id !== id);

      if (realDuplicates.length > 0) {
        if (updateProductDto.sku && realDuplicates.some(p => p.sku === sku)) {
          throw new ConflictException(`Ya existe un producto con el SKU: ${sku}`);
        }

        if (updateProductDto.barcode && realDuplicates.some(p => p.barcode === barcode)) {
          throw new ConflictException(`Ya existe un producto con el código de barras: ${barcode}`);
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
      await this.productRepository.update(id, updateProductDto);
      return this.findById(id);
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el producto: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.productRepository.delete(id);
  }

  async softRemove(id: string): Promise<Product> {
    const product = await this.findById(id);

    product.isActive = false;
    const deactivatedProduct = await this.productRepository.save(product);

    if (!deactivatedProduct) {
      throw new BadRequestException(`Error al desactivar el producto con ID ${id}`);
    }

    return deactivatedProduct;
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

      Logger.debug(
        `Searching products with SKU: ${trimmedSku} and Barcode: ${trimmedBarcode}`,
        'ProductService',
      );

      const results = await queryBuilder.getMany();

      Logger.debug(`Found ${results.length} products matching the criteria`, 'ProductService');

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
