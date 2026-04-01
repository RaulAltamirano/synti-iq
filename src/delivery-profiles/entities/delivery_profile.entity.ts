import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VehicleType } from 'src/delivery-profiles/enums/vehicle-type.enum';

@Entity('delivery_profiles')
@Index('IDX_delivery_profiles_is_approved', ['isApproved'])
@Index('IDX_delivery_profiles_is_available', ['isAvailable'])
export class DeliveryProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    enumName: 'delivery_vehicle_type_enum',
    name: 'vehicle_type',
  })
  vehicleType: VehicleType;

  @Column('text', { name: 'license_plate' })
  licensePlate: string;

  @Column('text', { name: 'zone' })
  zone: string;

  @Column('boolean', { default: false, name: 'is_available' })
  isAvailable: boolean;

  @Column('text', { array: true, nullable: true, name: 'preferred_zones' })
  preferredZones: string[];

  @Column('boolean', { default: false, name: 'is_approved' })
  isApproved: boolean;

  @Column('timestamp with time zone', { nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column('uuid', { nullable: true, name: 'approved_by' })
  approvedBy: string | null;

  @Column('timestamp with time zone', { nullable: true, name: 'last_activity_at' })
  lastActivityAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
