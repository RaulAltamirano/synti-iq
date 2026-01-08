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

@Entity('default_profile')
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
