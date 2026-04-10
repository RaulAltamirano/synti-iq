import { CustomerProfile } from 'src/customer-profile/entities/customer_profile.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => CustomerProfile, customer => customer.subscriptions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: CustomerProfile;

  @Column('varchar', { nullable: true })
  stripeSubscriptionId: string | null;

  @Column('varchar', { nullable: true })
  stripeCustomerId: string | null;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIALING,
  })
  status: SubscriptionStatus;

  @Column('timestamp with time zone', { nullable: true })
  trialStart: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  trialEnd: Date | null;

  @Column('timestamp with time zone')
  currentPeriodStart: Date;

  @Column('timestamp with time zone')
  currentPeriodEnd: Date;

  @Column('boolean', { default: false })
  cancelAtPeriodEnd: boolean;

  @Column('varchar', { nullable: true })
  planId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
