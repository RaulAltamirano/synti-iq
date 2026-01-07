import { InputType, PartialType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { CreateTimeBlockTemplateDto } from './create-time-block-template.dto';

@InputType()
export class UpdateTimeBlockTemplateDto extends PartialType(CreateTimeBlockTemplateDto) {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  startTimeOffset?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  endTimeOffset?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAssignments?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
