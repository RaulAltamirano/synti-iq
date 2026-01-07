import { User } from 'src/user/entities/user.entity';
import { Entity, TableInheritance, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('user_profiles')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
