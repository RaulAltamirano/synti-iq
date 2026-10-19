import { SaleItem } from 'src/sale-item/entities/sale-item.entity';
import { Store } from 'src/store/entities/store.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  saleNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: string; // Completada, cancelada, en proceso, etc.

  @ManyToOne(() => Store, store => store.sales, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'store_id' })
  storeId: string;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  customerId: string;

  @OneToMany(() => SaleItem, saleItem => saleItem.sale, { cascade: true })
  items: SaleItem[];

  @OneToMany(() => Transaction, transaction => transaction.sale)
  transactions: Transaction[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  paymentMethod: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ type: 'boolean', default: false })
  isRefunded: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
