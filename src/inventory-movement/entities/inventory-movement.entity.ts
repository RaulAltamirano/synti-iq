import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
}

@Entity()
@Index(['storeId', 'productId', 'createdAt'])
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  storeId: string;

  @Column()
  productId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  operation: 'add' | 'remove' | 'set' | 'transfer';

  @Column({ nullable: true })
  sourceStoreId?: string;

  @Column({ nullable: true })
  targetStoreId?: string;

  @Column()
  userId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  previousQuantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  newQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
