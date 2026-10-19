import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReferralCode } from './referral_code.entity';
import { User } from 'src/user/entities/user.entity';
import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';

@Entity('referral_usage')
export class ReferralUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  referralCodeId: string;

  @ManyToOne(() => ReferralCode, code => code.usages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referralCodeId' })
  referralCode: ReferralCode;

  @Column('uuid')
  referredUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referredUserId' })
  referredUser: User;

  @Column('uuid')
  referredBusinessProfileId: string;

  @ManyToOne(() => BusinessProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referredBusinessProfileId' })
  referredBusinessProfile: BusinessProfile;

  @CreateDateColumn()
  createdAt: Date;
}
