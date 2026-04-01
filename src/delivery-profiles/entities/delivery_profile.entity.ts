import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProfileApprovalLifecycleColumns } from 'src/shared/entities/profile-approval-lifecycle.columns';

@Entity('delivery_profiles')
export class DeliveryProfile extends ProfileApprovalLifecycleColumns {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  vehicleType: string;

  @Column('text')
  licensePlate: string;

  @Column('text')
  zone: string;

  @Column('boolean', { default: false })
  isAvailable: boolean;

  @Column('text', { array: true, nullable: true })
  preferredZones: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
