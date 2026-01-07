import { ObjectType, Field } from '@nestjs/graphql';
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

@ObjectType()
@Entity('recurring_schedule_template')
export class RecurringScheduleTemplate {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text')
  name: string;

  @Field(() => Store)
  @ManyToOne(() => Store, store => store.recurringTemplates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column('uuid', { name: 'store_id' })
  storeId: string;

  @Field(() => CashierProfile)
  @ManyToOne(() => CashierProfile, cashier => cashier.recurringTemplates)
  @JoinColumn({ name: 'cashier_id' })
  cashier: CashierProfile;

  @Column('uuid', { name: 'cashier_id' })
  cashierId: string;

  @Field(() => [RecurrenceRuleDto])
  @Column('jsonb', { default: [] })
  recurrenceRules: RecurrenceRuleDto[];

  @Field(() => Number)
  @Column('integer')
  durationMinutes: number;

  @Field(() => String)
  @Column('text')
  startTimeString: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
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
