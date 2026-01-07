import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import {
  AfterLoad,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
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

  @Field(() => [UserRole], { nullable: true })
  @OneToMany(() => UserRole, userRole => userRole.user)
  roles: UserRole[];

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

  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;

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
