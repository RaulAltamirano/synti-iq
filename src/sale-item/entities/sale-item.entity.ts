import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, sale => sale.items, { nullable: false })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ name: 'sale_id' })
  saleId: string;

  @ManyToOne(() => Inventory, { nullable: false })
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem: Inventory;

  @Column({ name: 'inventory_item_id' })
  inventoryItemId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  productName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  productDescription: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lineTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isRefunded: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
