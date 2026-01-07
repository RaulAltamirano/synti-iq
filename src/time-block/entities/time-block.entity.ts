import { ObjectType, Field } from '@nestjs/graphql';
import { CashierScheduleAssignment } from 'src/cashier-schedule-assignment/entities/cashier-schedule-assignment.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
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

@ObjectType()
@Entity('time_block')
export class TimeBlock {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('timestamp with time zone')
  startTime: Date;

  @Field()
  @Column('timestamp with time zone')
  endTime: Date;

  @Field()
  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Field(() => Number, { nullable: true })
  @Column('integer', { nullable: true, default: 1 })
  maxAssignments?: number; // Número máximo de cajeros que pueden asignarse

  @Field(() => StoreSchedule)
  @ManyToOne(() => StoreSchedule, storeSchedule => storeSchedule.timeBlocks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_schedule_id' })
  storeSchedule: StoreSchedule;

  @Field()
  @Column('uuid', { name: 'store_schedule_id' })
  storeScheduleId: string;

  @Field(() => TimeBlockTemplate, { nullable: true })
  @ManyToOne(() => TimeBlockTemplate, template => template.timeBlocks, {
    nullable: true,
  })
  @JoinColumn({ name: 'template_id' })
  template?: TimeBlockTemplate;

  @Field({ nullable: true })
  @Column('uuid', { name: 'template_id', nullable: true })
  templateId?: string;

  @Field(() => [CashierScheduleAssignment], { nullable: true })
  @OneToMany(() => CashierScheduleAssignment, assignment => assignment.timeBlock, {
    cascade: true,
  })
  assignments?: CashierScheduleAssignment[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  isBlockAvailable(): boolean {
    if (!this.isAvailable) return false;
    if (!this.assignments) return true;
    return this.assignments.length < (this.maxAssignments || 1);
  }

  getAvailableSlots(): number {
    if (!this.isAvailable) return 0;
    const maxSlots = this.maxAssignments || 1;
    const currentAssignments = this.assignments ? this.assignments.length : 0;
    return Math.max(0, maxSlots - currentAssignments);
  }

  isInTimeRange(startTime: Date, endTime: Date): boolean {
    return this.startTime >= startTime && this.endTime <= endTime && this.isAvailable;
  }

  overlapsWith(other: TimeBlock): boolean {
    return (
      this.startTime < other.endTime &&
      this.endTime > other.startTime &&
      this.isAvailable &&
      other.isAvailable
    );
  }
}
