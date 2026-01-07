import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsDateString, IsUUID, IsInt, Min, IsBoolean } from 'class-validator';

@InputType()
export class UpdateAssignmentDto {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  cashierId?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  updateFutureBlocks?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  updateFromDate?: Date;
}
