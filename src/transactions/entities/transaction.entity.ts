import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionType } from '../enums/TransactionType';
import { TransactionStatus } from '../enums/TransactionStatus';
import { CashRegisterSession } from 'src/cash_register_session/entities/cash_register_session.entity';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { Sale } from 'src/sale/entities/sale.entity';

@Entity('transactions')
@Index(['sessionId', 'createdAt'])
@Index(['type', 'status'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('text')
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CashierProfile)
  @JoinColumn({ name: 'cashier_id' })
  cashier: CashierProfile;

  @Column('uuid', { name: 'cashier_id' })
  cashierId: string;

  @ManyToOne(() => CashRegisterSession)
  @JoinColumn({ name: 'session_id' })
  session: CashRegisterSession;

  @Column('uuid', { name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => Sale, sale => sale.transactions, { nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column('uuid', { name: 'sale_id', nullable: true })
  saleId: string;

  @Column('text', { nullable: true })
  reference: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column('varchar', { length: 50, nullable: true })
  paymentMethod: string;

  @Column('varchar', { length: 100, nullable: true })
  paymentReference: string;

  @Column('uuid', { nullable: true })
  createdBy: string;

  @Column('uuid', { nullable: true })
  updatedBy: string;

  @Column('boolean', { default: false })
  isReconciled: boolean;

  @Column('timestamp', { nullable: true })
  reconciledAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;
}
