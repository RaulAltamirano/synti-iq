import { Controller, Get, Post, Body, Query, Param, Delete, Patch } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductFilterDto } from './dto/product-filter-dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator';
import { Permission } from 'src/shared/enums/permissions.enum';
import { ApiDoc } from 'src/shared/decorators';
import { productEndpoints } from 'src/docs/product.endpoints';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Auth('', [Permission.VIEW_PRODUCTS])
  @ApiDoc(productEndpoints, 'findAll')
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of products',
    type: [Product],
  })
  async findAll(@Query() filters: ProductFilterDto): Promise<PaginatedResponse<Product>> {
    return this.productService.findAll(filters);
  }

  @Get(':id')
  @Auth('', [Permission.VIEW_PRODUCTS])
  @ApiDoc(productEndpoints, 'findById')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the product',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findById(@Param('id') id: string): Promise<Product> {
    return this.productService.findById(id);
  }

  @Post()
  @Auth('', [Permission.CREATE_PRODUCTS])
  @ApiDoc(productEndpoints, 'create')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid product data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Product with same SKU or barcode already exists',
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  @Auth('', [Permission.UPDATE_PRODUCTS])
  @ApiDoc(productEndpoints, 'update')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid update data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Product with same SKU or barcode already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth('', [Permission.DELETE_PRODUCTS])
  @ApiDoc(productEndpoints, 'remove')
  @ApiOperation({ summary: 'Delete a product permanently' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.remove(id);
  }

  @Delete(':id/soft')
  @Auth('', [Permission.DELETE_PRODUCTS])
  @ApiDoc(productEndpoints, 'softRemove')
  @ApiOperation({ summary: 'Soft delete a product (deactivate)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deactivated',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async softRemove(@Param('id') id: string): Promise<Product> {
    return this.productService.softRemove(id);
  }

  @Get('search/sku-barcode')
  @Auth('', [Permission.VIEW_PRODUCTS])
  @ApiDoc(productEndpoints, 'findBySkuOrBarcode')
  @ApiOperation({ summary: 'Search products by SKU or barcode' })
  @ApiQuery({ name: 'sku', required: true, description: 'Product SKU' })
  @ApiQuery({
    name: 'barcode',
    required: false,
    description: 'Product barcode',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matching products',
    type: [Product],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid search parameters',
  })
  async findBySkuOrBarcode(
    @Query('sku') sku: string,
    @Query('barcode') barcode?: string,
  ): Promise<Product[]> {
    return this.productService.findBySkuOrBarcode(sku, barcode);
  }
}
