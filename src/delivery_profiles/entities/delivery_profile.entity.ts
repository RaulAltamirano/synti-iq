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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
