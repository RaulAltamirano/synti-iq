import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', {
    unique: true,
  })
  email: string;
  @Column('text', {
    select: false,
  })
  password: string;
  @Column('text')
  fullName: string;
  @Column('bool', {
    default: true,
  })
  isActive: boolean;
  @Column('bool', {
    default: false,
  })
  isDelete: boolean;
  @Column('timestamp', {
    default: new Date(),
  })
  createdAt?: Date;
  @Column('timestamp', {
    default: new Date(),
  })
  lastLogin?: Date;
  @Column('text', {
    array: true,
    default: ['user'],
  })
  userType: string[];
  @Column('text', {
    nullable: true,
  })
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];

  @Column({ nullable: true })
  refreshToken: string;
  updateTwoFactorSecret: any;

  twoFactorSecret: string;
}
