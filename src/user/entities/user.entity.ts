import { Field, ID, ObjectType } from '@nestjs/graphql';
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

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Field()
  @Column('text')
  fullName: string;

  @Field()
  @Column('bool', { default: true })
  isActive: boolean;

  @Field()
  @Column('bool', { default: false })
  isDelete: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  lastLogin: Date;

  @Field()
  @Column('bool', { default: false })
  isApproved: boolean;

  @Field(() => Boolean)
  @Column('bool', { default: false })
  isOnline: boolean;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  lastActivityAt: Date;

  @Field(() => String, { nullable: false })
  @Column('int', { nullable: false })
  roleId: number;

  @Field(() => Role, { nullable: false })
  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true, select: false })
  twoFactorSecret?: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  approvedAt: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  @Column('uuid', { nullable: true })
  approvedBy: string;

  @Field(() => UserProfile, { nullable: true })
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
