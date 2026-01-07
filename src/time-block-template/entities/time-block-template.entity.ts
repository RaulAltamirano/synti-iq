import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { TimeBlock } from '../../time-block/entities/time-block.entity';

@ObjectType()
@Entity('time_block_template')
@Index(['storeId', 'startTimeOffset', 'endTimeOffset'])
export class TimeBlockTemplate {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('varchar')
  name: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: string;

  @Field()
  @Column('integer')
  startTimeOffset: number; // Minutes from store opening time

  @Field()
  @Column('integer')
  endTimeOffset: number; // Minutes from store opening time

  @Field(() => Number, { nullable: true })
  @Column('integer', { nullable: true, default: 1 })
  maxAssignments?: number;

  @Field()
  @Column('uuid', { name: 'store_id' })
  storeId: string;

  @Field(() => Store)
  @ManyToOne(() => Store, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Field(() => [TimeBlock], { nullable: true })
  @OneToMany(() => TimeBlock, timeBlock => timeBlock.template)
  timeBlocks?: TimeBlock[];

  @Field()
  @Column('boolean', { default: true })
  isActive: boolean;

  @Field(() => [Number], { nullable: true })
  @Column('integer', { array: true, nullable: true })
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  endDate?: Date;

  @Field(() => Boolean, { nullable: true })
  @Column('boolean', { nullable: true, default: false })
  isRecurring?: boolean;

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  recurrencePattern?: string; // e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR"

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
