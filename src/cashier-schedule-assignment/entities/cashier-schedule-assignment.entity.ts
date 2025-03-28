import { ObjectType, Field } from '@nestjs/graphql';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';

@ObjectType()
@Entity('cashier_schedule_assignment')
export class CashierScheduleAssignment {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con StoreSchedule
  @Field(() => StoreSchedule, { nullable: true })
  @ManyToOne(() => StoreSchedule, (schedule) => schedule.cashierAssignments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schedule_id' })
  schedule: StoreSchedule;

  @Field({ nullable: true })
  @Column('uuid', { nullable: true })
  scheduleId: string;

  // Relación con RecurringScheduleTemplate
  @Field(() => RecurringScheduleTemplate, { nullable: true })
  @ManyToOne(
    () => RecurringScheduleTemplate,
    (template) => template.cashierAssignments,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'recurring_template_id' })
  recurringTemplate: RecurringScheduleTemplate;

  @Field({ nullable: true })
  @Column('uuid', { nullable: true })
  recurringTemplateId: string;

  @Field(() => CashierProfile)
  @ManyToOne(() => CashierProfile, (cashier) => cashier.scheduleAssignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cashier_id' })
  cashier: CashierProfile;

  @Field()
  @Column('uuid')
  cashierId: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    nullable: true,
  })
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  actualStartTime: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  actualEndTime: Date;
}
