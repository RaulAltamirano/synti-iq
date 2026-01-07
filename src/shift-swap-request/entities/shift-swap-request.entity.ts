import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID, IsNotEmpty, IsDate, IsString, IsIn, IsOptional } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export enum ShiftSwapRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity()
export class ShiftSwapRequest {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string = uuidv4();

  @Column({ type: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  requesterId: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  targetCashierId: string;

  @Column({
    type: 'enum',
    enum: ShiftSwapRequestStatus,
    default: ShiftSwapRequestStatus.PENDING,
  })
  @IsString()
  @IsIn(Object.values(ShiftSwapRequestStatus))
  status: ShiftSwapRequestStatus;

  @CreateDateColumn({ type: 'timestamp' })
  @IsDate()
  requestDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsDate()
  @IsOptional()
  responseDate: Date | null;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
