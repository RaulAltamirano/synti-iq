import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssignmentStatus } from '../enums/assignment-status.dto';

@Entity('cashier_schedule_assignment')
export class CashierScheduleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TimeBlock, timeBlock => timeBlock.storeSchedule, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'time_block_id' })
  timeBlock: TimeBlock;

  @Column('uuid', { name: 'time_block_id' })
  timeBlockId: string;

  @ManyToOne(() => CashierProfile, cashier => cashier.scheduleAssignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cashier_id' })
  cashier: CashierProfile;

  @Column('uuid', { name: 'cashier_id' })
  cashierId: string;

  @Column('uuid', { name: 'recurring_template_id', nullable: true })
  recurringTemplateId?: string;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.SCHEDULED,
  })
  status: AssignmentStatus;

  @Column('timestamp with time zone', { nullable: true })
  actualStartTime?: Date;

  @Column('timestamp with time zone', { nullable: true })
  actualEndTime?: Date;

  @ManyToOne(() => CashierProfile, { nullable: true })
  @JoinColumn({ name: 'swap_requested_with_id' })
  swapRequestedWith?: CashierProfile;

  @Column('uuid', { name: 'swap_requested_with_id', nullable: true })
  swapRequestedWithId?: string;

  @Column('text', { nullable: true })
  reason?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
