import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('user_backup_codes')
@Index(['userId', 'codeHash'])
export class UserBackupCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('varchar', { length: 64 })
  codeHash: string;

  @Column('timestamp with time zone', { nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
