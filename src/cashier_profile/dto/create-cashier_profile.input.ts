import { Field } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsDate } from 'class-validator';

export class CreateCashierProfileInput {
  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  id?: string;

  @IsUUID()
  @Field()
  userId: string;

  @IsString()
  @Field()
  branchOffice: string;

  @IsString()
  @Field()
  cashierNumber: string;

  @IsOptional()
  @IsDate()
  @Field(() => Date, { nullable: true })
  shiftStartTime?: Date;

  @IsOptional()
  @IsDate()
  @Field(() => Date, { nullable: true })
  shiftEndTime?: Date;
}
