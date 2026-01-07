import { ObjectType, Field } from '@nestjs/graphql';
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

@ObjectType()
@Entity('store_schedule')
export class StoreSchedule {
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
  @Column('uuid', { name: 'store_id' })
  storeId: string;

  @Field(() => Store)
  @ManyToOne(() => Store, store => store.schedules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Field(() => [TimeBlock], { nullable: true })
  @OneToMany(() => TimeBlock, timeBlock => timeBlock.storeSchedule)
  timeBlocks?: TimeBlock[];

  @Field(() => String)
  @Column('text')
  dayOfWeek: string; // e.g., '

  @Field()
  @Column('time with time zone') // Hora de apertura
  openTime: Date;

  @Field()
  @Column('time with time zone') // Hora de cierre
  closeTime: Date;

  @Field()
  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
