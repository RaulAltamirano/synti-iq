import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('delivery_profiles')
export class DeliveryProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Field()
  @Column('text')
  vehicleType: string;

  @Field()
  @Column('text')
  licensePlate: string;

  @Field()
  @Column('text')
  zone: string;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  isAvailable: boolean;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  preferredZones: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
