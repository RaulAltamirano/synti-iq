import { Inventory } from 'src/inventory/entities/inventory.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategorie } from 'src/product-categorie/entities/product-categorie.entity';

@Entity('product')
export class Product {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Headphones',
  })
  @Column({ length: 100, nullable: false })
  @Index() // Indexar para búsquedas rápidas por nombre
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'PH-001',
  })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  @Index() // Indexar para búsquedas rápidas por SKU
  sku: string; // Stock Keeping Unit - código único para cada producto

  @ApiProperty({
    description: 'Product barcode',
    example: '123456789012',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  @Index() // Indexar para búsquedas rápidas por código de barras
  barcode: string;

  @ApiProperty({
    description: 'Product purchase price',
    example: 50.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchasePrice: number;

  @ApiProperty({
    description: 'Product selling price',
    example: 99.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  size: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color: string;

  @ApiProperty({
    description: 'Product brand',
    example: 'Sony',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string;

  @Column({ type: 'simple-json', nullable: true })
  dimensions: {
    height: number;
    width: number;
    depth: number;
    weight: number;
    unit: string;
  };

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => ProductCategorie, category => category.products)
  @JoinColumn({ name: 'category_product_id' })
  category: ProductCategorie;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => Inventory, inventory => inventory.product)
  inventoryItems: Inventory[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @ApiProperty({
    description: 'Product sales rank',
    example: 100,
    required: false,
  })
  @Column({ type: 'int', default: 0 })
  @Index() // Indexar para búsquedas rápidas por popularidad
  salesRank: number;

  @ApiProperty({
    description: 'Product profit margin percentage',
    example: 50,
    required: false,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  profitMargin: number;

  @ApiProperty({
    description: 'Whether the product is perishable',
    example: false,
    default: false,
  })
  @Column({ default: false })
  isPerishable: boolean;

  @Column({ nullable: true })
  expirationPeriod: number; // en días

  @Column({ nullable: true })
  leadTime: number; // tiempo de entrega desde proveedor en días

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @ApiProperty({
    description: 'Product tags',
    example: ['electronics', 'audio'],
    type: [String],
  })
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  @Index()
  totalStock: number;

  @Column({ type: 'int', default: 0 })
  @Index()
  minimumStock: number;

  @Column({ type: 'int', default: 0 })
  @Index()
  maximumStock: number;

  @Column({ type: 'simple-json', nullable: true })
  stockAlerts: {
    lowStock: boolean;
    outOfStock: boolean;
    overStock: boolean;
  };
}
