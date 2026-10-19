import { Store } from 'src/store/entities/store.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Point,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AddressType } from '../enums/address-type.enum';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  fullAddress: string;

  @Column('text', { nullable: true })
  addressReference: string;

  @Column('varchar', { length: 255, nullable: true })
  street: string | null;

  @Column('varchar', { length: 100, nullable: true })
  neighborhood: string | null;

  @Column('varchar', { length: 100, nullable: true })
  city: string | null;

  @Column('varchar', { length: 100, nullable: true })
  state: string | null;

  @Column('varchar', { length: 20, nullable: true })
  postalCode: string | null;

  @Column('varchar', { length: 100, nullable: true })
  country: string | null;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  coordinates: Point;
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Store, store => store.location)
  store: Store | null;

  @Column('boolean', { default: false })
  isDefault: boolean;

  @Column({
    type: 'enum',
    enum: AddressType,
    nullable: true,
  })
  addressType: AddressType | null;

  @Column('boolean', { default: false })
  isDefaultShipping: boolean;

  @Column('boolean', { default: false })
  isDefaultBilling: boolean;

  @Index('IDX_locations_user_addressType', ['userId', 'addressType'])
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
