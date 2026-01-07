import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

@InputType()
export class CreateTimeBlockDto {
  @Field()
  @IsNotEmpty()
  @IsDateString()
  startTime: Date;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  endTime: Date;

  @Field({ nullable: true, defaultValue: true })
  @IsBoolean()
  isAvailable?: boolean;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  storeScheduleId: string;

  @Field(() => Number, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;
}
