import { Role } from 'src/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text', { name: 'firstName' })
  firstName: string;

  @Column('text', { name: 'lastName' })
  lastName: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('bool', { default: false })
  isDelete: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  lastLogin: Date;

  @Column('int', { nullable: false })
  roleId: number;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true, select: false })
  twoFactorSecret?: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserProfile, profile => profile.user, { nullable: true })
  profile?: UserProfile;
}
