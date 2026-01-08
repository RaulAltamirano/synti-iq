import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('provider_profiles')
export class ProviderProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text')
  companyName: string;

  @Field()
  @Column('text')
  taxId: string;

  @Field()
  @Column('text')
  contactPhone: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  address?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  specialties?: string[];

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
