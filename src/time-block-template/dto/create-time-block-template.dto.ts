import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min, IsOptional, IsUUID, IsString } from 'class-validator';

@InputType()
export class CreateTimeBlockTemplateDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  startTimeOffset: number; // Minutes from store opening time

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  endTimeOffset: number; // Minutes from store opening time

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  storeId: string;
}
