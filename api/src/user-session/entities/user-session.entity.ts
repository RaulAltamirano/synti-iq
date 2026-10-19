import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceInfoDto } from '../dto/device-info.dto';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid', { unique: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 1024 })
  refreshToken: string;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: DeviceInfoDto;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column()
  lastUsed: Date;

  @Column({ default: true })
  isValid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
