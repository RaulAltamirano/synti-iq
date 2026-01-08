import { Role } from 'src/role/entities/role.entity';
import {
  AfterLoad,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from 'src/user_profile/entities/user_profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('bool', { default: false })
  isDelete: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  lastLogin: Date;

  @Column('bool', { default: false })
  isApproved: boolean;

  @Column('bool', { default: false })
  isOnline: boolean;

  @Column('timestamp with time zone', { nullable: true })
  lastActivityAt: Date;

  @Column('int', { nullable: false })
  roleId: number;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true, select: false })
  twoFactorSecret?: string;

  @Column('timestamp with time zone', { nullable: true })
  approvedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  approvedBy: string;

  @OneToOne(() => UserProfile, profile => profile.user, { nullable: true })
  profile?: UserProfile;

  @BeforeUpdate()
  updateLastActivity() {
    this.lastActivityAt = new Date();
  }

  @AfterLoad()
  updateOnlineStatus() {
    const ONLINE_THRESHOLD = 5 * 60 * 1000;
    this.isOnline = this.lastActivityAt
      ? new Date().getTime() - this.lastActivityAt.getTime() < ONLINE_THRESHOLD
      : false;
  }
}
