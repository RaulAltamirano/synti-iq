import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('provider_profiles')
export class ProviderProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  companyName: string;

  @Column('text')
  taxId: string;

  @Column('text')
  contactPhone: string;

  @Column('text', { nullable: true })
  address?: string;

  @Column('text', { array: true, nullable: true })
  specialties?: string[];

  @Column('boolean', { default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
