import { Product } from 'src/product/entities/product.entity';
import { Store } from 'src/store/entities/store.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  Check,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum InventoryStatus {
  AVAILABLE = 'available',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
  DISCONTINUED = 'discontinued',
}

@Entity('inventory')
@Index(['storeId', 'productId'], { unique: true })
@Check(`"quantity" >= 0`)
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store, store => store.inventoryItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ nullable: false })
  @Index() // Indexar para búsquedas rápidas por tienda
  storeId: string;

  @ManyToOne(() => Product, product => product.inventoryItems, {
    eager: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: false })
  @Index() // Indexar para búsquedas rápidas por producto
  productId: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ type: 'int', nullable: true })
  minimumStock: number;

  @Column({ type: 'int', nullable: true })
  maximumStock: number;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.AVAILABLE,
  })
  @Index()
  status: InventoryStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string; // ubicación dentro de la tienda (pasillo, estante, etc.)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lastPurchasePrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  @Index()
  lastStockCheck: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastReceivedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastSoldAt: Date;

  @Column({ type: 'int', default: 0 })
  stockTurnover: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  stockTurnoverDays: number;

  @BeforeInsert()
  @BeforeUpdate()
  updateStatus() {
    if (this.quantity <= 0) {
      this.status = InventoryStatus.OUT_OF_STOCK;
    } else if (this.minimumStock && this.quantity <= this.minimumStock) {
      this.status = InventoryStatus.LOW_STOCK;
    } else {
      this.status = InventoryStatus.AVAILABLE;
    }
  }

  availableQuantity: number;

  @AfterLoad()
  calculateAvailableQuantity() {
    this.availableQuantity = this.quantity - (this.reservedQuantity || 0);
  }
}
