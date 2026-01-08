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

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  fullAddress: string; // Nombre más descriptivo que 'address'

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

  @Column('boolean', { default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
