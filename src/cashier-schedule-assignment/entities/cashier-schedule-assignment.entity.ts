import { ObjectType, Field } from '@nestjs/graphql';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssignmentStatus } from '../enums/assignment-status.dto';

@ObjectType()
@Entity('cashier_schedule_assignment')
export class CashierScheduleAssignment {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Bloque de tiempo asignado
  @Field(() => TimeBlock)
  @ManyToOne(() => TimeBlock, (timeBlock) => timeBlock.storeSchedule, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'time_block_id' })
  timeBlock: TimeBlock;

  @Field()
  @Column('uuid', { name: 'time_block_id' })
  timeBlockId: string;

  // Cajero asignado
  @Field(() => CashierProfile)
  @ManyToOne(() => CashierProfile, (cashier) => cashier.scheduleAssignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cashier_id' })
  cashier: CashierProfile;

  @Field()
  @Column('uuid', { name: 'cashier_id' })
  cashierId: string;

  // Referencia a plantilla recurrente (si aplica)
  @Field({ nullable: true })
  @Column('uuid', { name: 'recurring_template_id', nullable: true })
  recurringTemplateId?: string;

  // Estado de la asignación
  @Field(() => AssignmentStatus)
  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.SCHEDULED,
  })
  status: AssignmentStatus;

  // Tiempos reales de la asignación
  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  actualStartTime?: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  actualEndTime?: Date;

  // Solicitud de cambio
  @Field(() => CashierProfile, { nullable: true })
  @ManyToOne(() => CashierProfile, { nullable: true })
  @JoinColumn({ name: 'swap_requested_with_id' })
  swapRequestedWith?: CashierProfile;

  @Field({ nullable: true })
  @Column('uuid', { name: 'swap_requested_with_id', nullable: true })
  swapRequestedWithId?: string;

  // Razón de cancelación o cambio
  @Field({ nullable: true })
  @Column('text', { nullable: true })
  reason?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
