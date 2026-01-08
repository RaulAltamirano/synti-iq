import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';

@Entity('cash_register_sessions')
export class CashRegisterSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CashierProfile)
  @JoinColumn()
  cashier: CashierProfile;

  @Column('timestamp with time zone')
  openedAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  closedAt: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  initialBalance: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  finalBalance: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany(() => Transaction, transaction => transaction.session)
  transactions: Transaction[];

  @Column('uuid')
  branchOfficeId: string;
}
