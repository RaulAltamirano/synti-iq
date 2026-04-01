import { Store } from 'src/store/entities/store.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { ProfileApprovalLifecycleColumns } from 'src/shared/entities/profile-approval-lifecycle.columns';

@Entity('cashier_profiles')
@Unique('UQ_cashier_profiles_store_cashier_number', ['storeId', 'cashierNumber'])
@Index('IDX_cashier_profiles_is_approved', ['isApproved'])
export class CashierProfile extends ProfileApprovalLifecycleColumns {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store, store => store.cashiers, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'store_id' })
  storeId: string;

  @Column('text', { name: 'branch_office' })
  branchOffice: string;

  @Column('text', { name: 'cashier_number' })
  cashierNumber: string;

  @Column('timestamp with time zone', { nullable: true, name: 'shift_start_time' })
  shiftStartTime: Date;

  @Column('timestamp with time zone', { nullable: true, name: 'shift_end_time' })
  shiftEndTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
