import { Field, ObjectType } from '@nestjs/graphql';
import { Location } from 'src/location/entities/location.entity';
import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('default_profile')
// @ChildEntity('default_profile')
export class DefaultProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column('jsonb', { nullable: true })
  preferences: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };

  @Field(() => Location, { nullable: true })
  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn()
  defaultAddress: Location;

  @Column('text', { array: true, nullable: true })
  wishlist: string[];

  @Column('text', { array: true, nullable: true })
  viewedProducts: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
