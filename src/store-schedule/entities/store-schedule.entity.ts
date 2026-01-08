import { Store } from 'src/store/entities/store.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
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

@Entity('store_schedule')
export class StoreSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('uuid', { name: 'store_id' })
  storeId: string;

  @ManyToOne(() => Store, store => store.schedules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.storeSchedule)
  timeBlocks?: TimeBlock[];

  @Column('text')
  dayOfWeek: string; // e.g., '

  @Column('time with time zone') // Hora de apertura
  openTime: Date;

  @Column('time with time zone') // Hora de cierre
  closeTime: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
