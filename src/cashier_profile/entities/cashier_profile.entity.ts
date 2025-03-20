import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
} from 'typeorm';

@ObjectType()
@Entity('cashier_profiles')
export class CashierProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Field()
  @Column('text')
  branchOffice: string;

  @Field()
  @Column('text')
  cashierNumber: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  shiftStartTime: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { nullable: true })
  shiftEndTime: Date;
}
