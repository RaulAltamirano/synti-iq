import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max, IsArray } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';
import { ApiProperty } from '@nestjs/swagger';

export class ProductFilterDto extends BasePaginationParams {
  @ApiProperty({
    description: 'Filter products by name (case-insensitive partial match)',
    example: 'headphones',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filter products by SKU',
    example: 'PH-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    description: 'Filter products by barcode',
    example: '123456789012',
    required: false,
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: 'Filter products by brand',
    example: 'Sony',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    description: 'Filter products by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiProperty({
    description: 'Minimum selling price',
    example: 50.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum selling price',
    example: 200.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Minimum profit margin percentage',
    example: 20,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  minProfitMargin?: number;

  @ApiProperty({
    description: 'Filter products by perishable status',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPerishable?: boolean;

  @ApiProperty({
    description: 'Minimum sales rank',
    example: 100,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  salesRankMin?: number;

  @ApiProperty({
    description: 'Filter products by tags',
    example: ['electronics', 'audio'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  orderBy?: 'name' | 'createdAt' | 'sellingPrice' | 'salesRank' | 'profitMargin';

  @IsOptional()
  @IsString()
  orderDirection?: 'ASC' | 'DESC';
}
