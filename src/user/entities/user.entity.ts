import { Role } from 'src/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false, nullable: true })
  password: string | null;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Column('timestamp with time zone', { nullable: true, name: 'last_login' })
  lastLogin: Date;

  @Index()
  @Column('int', { nullable: false, name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'two_factor_secret', nullable: true, select: false })
  twoFactorSecret?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToOne(() => UserProfile, profile => profile.user, { nullable: true })
  profile?: UserProfile;
}
