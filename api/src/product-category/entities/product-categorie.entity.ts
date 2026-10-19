import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';

@Entity('product_categorie')
export class ProductCategorie {
  @ApiProperty({
    description: 'Unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @Column({ length: 100, nullable: false })
  @Index()
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electronic devices and accessories',
  })
  @Column({ length: 255, nullable: true })
  description: string;

  @ApiProperty({
    description: 'Category code',
    example: 'ELEC-001',
  })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  @Index()
  code: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Category level in hierarchy',
    example: 1,
  })
  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ nullable: true })
  parentId: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @ApiProperty({
    description: 'Category tags',
    example: ['electronics', 'gadgets'],
    type: [String],
  })
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
