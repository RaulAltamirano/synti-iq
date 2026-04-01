import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Check,
  Index,
  Unique,
} from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';

/**
 * Polymorphic link: one row per user, pointing at a domain profile when applicable.
 *
 * **Unique constraint `(profile_type, profile_id)`:** In PostgreSQL, `NULL` values are
 * not considered equal in unique constraints, so multiple rows may share
 * `(profile_type = 'admin', profile_id IS NULL)` (or `manager`) without violating
 * uniqueness — this matches the intended model for global roles without a domain row.
 */
@Entity('user_profiles')
@Check(
  `(profile_type IN ('cashier', 'delivery', 'provider', 'customer', 'business_owner') AND profile_id IS NOT NULL) OR (profile_type IN ('admin', 'manager') AND profile_id IS NULL)`,
)
@Unique('UQ_user_profiles_profile_type_id', ['profileType', 'profileId'])
@Index('IDX_user_profiles_type_profile', ['profileType', 'profileId'])
@Index('IDX_user_profiles_type', ['profileType'])
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid', { unique: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: SystemRole, name: 'profile_type' })
  profileType: SystemRole;

  @Column('uuid', { nullable: true, name: 'profile_id' })
  profileId?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
