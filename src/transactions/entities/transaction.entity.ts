import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
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

@ObjectType()
@Entity('transactions')
@Index(['sessionId', 'createdAt'])
@Index(['type', 'status'])
export class Transaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => TransactionType)
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Field()
  @Column('text')
  description: string;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => CashierProfile)
  @ManyToOne(() => CashierProfile)
  @JoinColumn({ name: 'cashier_id' })
  cashier: CashierProfile;

  @Field(() => String)
  @Column('uuid', { name: 'cashier_id' })
  cashierId: string;

  @Field(() => CashRegisterSession)
  @ManyToOne(() => CashRegisterSession)
  @JoinColumn({ name: 'session_id' })
  session: CashRegisterSession;

  @Field(() => String)
  @Column('uuid', { name: 'session_id' })
  sessionId: string;

  @Field(() => Sale, { nullable: true })
  @ManyToOne(() => Sale, sale => sale.transactions, { nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Field(() => String, { nullable: true })
  @Column('uuid', { name: 'sale_id', nullable: true })
  saleId: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  reference: string;

  @Field(() => TransactionStatus)
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 50, nullable: true })
  paymentMethod: string;

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 100, nullable: true })
  paymentReference: string;

  @Field(() => String, { nullable: true })
  @Column('uuid', { nullable: true })
  createdBy: string;

  @Field(() => String, { nullable: true })
  @Column('uuid', { nullable: true })
  updatedBy: string;

  @Field(() => Boolean, { defaultValue: false })
  @Column('boolean', { default: false })
  isReconciled: boolean;

  @Field(() => Date, { nullable: true })
  @Column('timestamp', { nullable: true })
  reconciledAt: Date;

  @Field(() => String, { nullable: true })
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;
}
