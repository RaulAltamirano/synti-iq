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

@Entity('time_block_template')
@Index(['storeId', 'startTimeOffset', 'endTimeOffset'])
export class TimeBlockTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('integer')
  startTimeOffset: number; // Minutes from store opening time

  @Column('integer')
  endTimeOffset: number; // Minutes from store opening time

  @Column('integer', { nullable: true, default: 1 })
  maxAssignments?: number;

  @Column('uuid', { name: 'store_id' })
  storeId: string;

  @ManyToOne(() => Store, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.template)
  timeBlocks?: TimeBlock[];

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('integer', { array: true, nullable: true })
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday

  @Column('timestamp with time zone', { nullable: true })
  startDate?: Date;

  @Column('timestamp with time zone', { nullable: true })
  endDate?: Date;

  @Column('boolean', { nullable: true, default: false })
  isRecurring?: boolean;

  @Column('varchar', { nullable: true })
  recurrencePattern?: string; // e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR"

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
