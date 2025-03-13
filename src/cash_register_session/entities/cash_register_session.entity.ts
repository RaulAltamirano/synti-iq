import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';

@ObjectType()
@Entity('cash_register_sessions')
export class CashRegisterSession {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CashierProfile)
  @JoinColumn()
  cashier: CashierProfile;

  @Field(() => Date)
  @Column('timestamp with time zone')
  openedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  closedAt: Date;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  initialBalance: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  finalBalance: number;

  @Field(() => Boolean)
  @Column('boolean', { default: true })
  isActive: boolean;

  @Field(() => [Transaction])
  @OneToMany(() => Transaction, (transaction) => transaction.session)
  transactions: Transaction[];

  @Field(() => String)
  @Column('uuid')
  branchOfficeId: string;
}
