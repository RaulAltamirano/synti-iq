import { IsString, IsDate, IsOptional, IsNumber, Min, IsUUID, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field } from '@nestjs/graphql';

export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

/**
 * DTO para crear una asignación de horario
 */
@InputType()
export class CreateAssignmentDto {
  @Field()
  @IsUUID()
  cashierId: string;

  @Field()
  @IsUUID()
  storeScheduleId: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @Field()
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAssignments?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @Field()
  @IsUUID()
  storeId: string;

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrenceType?: RecurrenceType;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  timeBlockId?: string;
}

/**
 * DTO para solicitar un intercambio de turno
 */
export class RequestShiftSwapDto {
  @IsString()
  assignmentId: string;

  @IsString()
  requestedCashierId: string;

  @IsOptional()
  @IsString()
  reason?: string;
} 