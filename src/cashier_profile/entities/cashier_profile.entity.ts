import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { Store } from 'src/store/entities/store.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
@Entity('cashier_profiles')
export class CashierProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store, store => store.cashiers, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column()
  storeId: string;

  @Field(() => [CashierScheduleAssignment])
  @OneToMany(() => CashierScheduleAssignment, assignment => assignment.cashier)
  scheduleAssignments: CashierScheduleAssignment[];

  @Field(() => [RecurringScheduleTemplate])
  @OneToMany(() => RecurringScheduleTemplate, template => template.cashier)
  recurringTemplates: RecurringScheduleTemplate[];

  @Field()
  @Column('text')
  branchOffice: string;

  @Field()
  @Column('text')
  cashierNumber: string;

  @Field(() => StoreSchedule, { nullable: true })
  @ManyToOne(() => StoreSchedule, { nullable: true })
  @JoinColumn({ name: 'assigned_schedule_id' })
  assignedSchedule: StoreSchedule;

  @Column({ nullable: true })
  assignedScheduleId: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  shiftStartTime: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  shiftEndTime: Date;
}
