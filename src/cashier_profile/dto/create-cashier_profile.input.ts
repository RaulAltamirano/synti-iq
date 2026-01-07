import { Field } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsDate } from 'class-validator';

export class CreateCashierProfileInput {
  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  id?: string;

  @IsUUID()
  @Field()
  userId: string;

  @IsUUID()
  @Field()
  storeId: string;

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
