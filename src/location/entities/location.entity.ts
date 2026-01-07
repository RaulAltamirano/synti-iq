import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Store } from 'src/store/entities/store.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Point,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

ObjectType();
@Entity('locations')
export class Location {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text')
  name: string;

  @Field()
  @Column('text')
  fullAddress: string; // Nombre más descriptivo que 'address'

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  addressReference: string; // Nombre más claro para la referencia

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true, // Permite valores nulos
  })
  coordinates: Point;
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => Store, store => store.location)
  stores: Store[];

  @Field()
  @Column('boolean', { default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
