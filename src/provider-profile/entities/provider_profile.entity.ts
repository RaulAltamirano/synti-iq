import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('provider_profiles')
@Index('IDX_provider_profiles_is_approved', ['isApproved'])
@Index('IDX_provider_profiles_is_verified', ['isVerified'])
export class ProviderProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { name: 'company_name' })
  companyName: string;

  @Column('text', { unique: true, name: 'tax_id' })
  taxId: string;

  @Column('text', { name: 'contact_phone' })
  contactPhone: string;

  @Column('text', { nullable: true, name: 'address' })
  address?: string;

  @Column('text', { array: true, nullable: true, name: 'specialties' })
  specialties?: string[];

  @Column('boolean', { default: false, name: 'is_verified' })
  isVerified: boolean;

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
