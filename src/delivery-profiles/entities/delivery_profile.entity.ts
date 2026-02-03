import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('delivery_profiles')
export class DeliveryProfile {
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

  @Column('boolean', { default: false })
  isApproved: boolean;

  @Column('timestamp with time zone', { nullable: true })
  approvedAt: Date | null;

  @Column('uuid', { nullable: true })
  approvedBy: string | null;

  @Column('timestamp with time zone', { nullable: true })
  lastActivityAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
