import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Subscription } from 'src/subscription/entities/subscription.entity';

@Entity('customer_profiles')
export class CustomerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Subscription, subscription => subscription.customer)
  subscriptions: Subscription[];
}
