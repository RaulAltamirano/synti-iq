import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  Index,
} from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';

@Entity('user_profiles')
@Check(
  `(profile_type IN ('cashier', 'delivery', 'provider') AND profile_id IS NOT NULL) OR (profile_type IN ('admin', 'manager', 'customer') AND profile_id IS NULL)`,
)
@Index(['profileType', 'profileId'])
@Index(['profileType'])
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({ type: 'enum', enum: SystemRole, name: 'profile_type' })
  profileType: SystemRole;

  @Column('uuid', { nullable: true, name: 'profile_id' })
  profileId?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
