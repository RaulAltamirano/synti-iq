import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
  IsUUID,
  IsBoolean,
  IsUrl,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Headphones',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'PH-001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Product barcode',
    example: '123456789012',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({
    description: 'Product purchase price',
    example: 50.0,
    required: true,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({
    description: 'Product selling price',
    example: 99.99,
    required: true,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  taxRate: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  size?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  color?: string;

  @ApiProperty({
    description: 'Product brand',
    example: 'Sony',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  brand?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({
    description: 'Store ID where the product will be available',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salesRank?: number;

  @ApiProperty({
    description: 'Product profit margin percentage',
    example: 50,
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  profitMargin?: number;

  @ApiProperty({
    description: 'Whether the product is perishable',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPerishable?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expirationPeriod?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  leadTime?: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Product tags',
    example: ['electronics', 'audio'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
