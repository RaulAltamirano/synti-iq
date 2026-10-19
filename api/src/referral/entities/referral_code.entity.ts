import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { ReferralUsage } from './referral_usage.entity';

@Entity('referral_codes')
export class ReferralCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 12, unique: true })
  code: string;

  @Column('uuid')
  businessProfileId: string;

  @ManyToOne(() => BusinessProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessProfileId' })
  businessProfile: BusinessProfile;

  @Column('int', { default: 0 })
  trialDaysBonus: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ReferralUsage, usage => usage.referralCode)
  usages: ReferralUsage[];
}
