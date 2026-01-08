import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { Store } from 'src/store/entities/store.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
@Entity('cashier_profiles')
export class CashierProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store, store => store.cashiers, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column()
  storeId: string;

  @OneToMany(() => CashierScheduleAssignment, assignment => assignment.cashier)
  scheduleAssignments: CashierScheduleAssignment[];

  @OneToMany(() => RecurringScheduleTemplate, template => template.cashier)
  recurringTemplates: RecurringScheduleTemplate[];

  @Column('text')
  branchOffice: string;

  @Column('text')
  cashierNumber: string;

  @ManyToOne(() => StoreSchedule, { nullable: true })
  @JoinColumn({ name: 'assigned_schedule_id' })
  assignedSchedule: StoreSchedule;

  @Column({ nullable: true })
  assignedScheduleId: string;

  @Column('timestamp with time zone', { nullable: true })
  shiftStartTime: Date;

  @Column('timestamp with time zone', { nullable: true })
  shiftEndTime: Date;
}
