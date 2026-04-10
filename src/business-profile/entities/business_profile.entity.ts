import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Store } from 'src/store/entities/store.entity';

@Entity('business_profiles')
export class BusinessProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @OneToMany(() => Store, store => store.businessProfile)
  stores: Store[];

  @Column('text', { nullable: true })
  taxId?: string;

  @Column('text', { nullable: true })
  contactPhone?: string;

  @Column('text', { nullable: true })
  address?: string;

  @Column('boolean', { default: false })
  isVerified: boolean;

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
