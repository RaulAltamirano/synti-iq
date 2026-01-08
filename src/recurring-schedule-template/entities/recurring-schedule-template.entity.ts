import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { Store } from 'src/store/entities/store.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecurrenceRuleDto } from './recurring-rules.dto';

@Entity('recurring_schedule_template')
export class RecurringScheduleTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @ManyToOne(() => Store, store => store.recurringTemplates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column('uuid', { name: 'store_id' })
  storeId: string;

  @ManyToOne(() => CashierProfile, cashier => cashier.recurringTemplates)
  @JoinColumn({ name: 'cashier_id' })
  cashier: CashierProfile;

  @Column('uuid', { name: 'cashier_id' })
  cashierId: string;

  @Column('jsonb', { default: [] })
  recurrenceRules: RecurrenceRuleDto[];

  @Column('integer')
  durationMinutes: number;

  @Column('text')
  startTimeString: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('timestamp with time zone', { nullable: true })
  startDate?: Date;

  @Column('timestamp with time zone', { nullable: true })
  endDate?: Date;

  @OneToMany(() => CashierScheduleAssignment, assignment => assignment.recurringTemplateId)
  generatedAssignments: CashierScheduleAssignment[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
  timeBlockTemplates: any;
}
