import { Field, ID, ObjectType } from '@nestjs/graphql';
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

@ObjectType()
@Entity('user_profiles')
@Check(
  `(profile_type IN ('cashier', 'delivery', 'provider') AND profile_id IS NOT NULL) OR (profile_type IN ('admin', 'manager', 'customer') AND profile_id IS NULL)`,
)
@Index(['profileType', 'profileId'])
@Index(['profileType'])
export class UserProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Field(() => SystemRole)
  @Column({ type: 'enum', enum: SystemRole, name: 'profile_type' })
  profileType: SystemRole;

  @Field(() => String, { nullable: true })
  @Column('uuid', { nullable: true, name: 'profile_id' })
  profileId?: string;

  @Field(() => Object, { nullable: true })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
