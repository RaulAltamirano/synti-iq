import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateStoreInput {
  @Field() name: string;
  @Field() address: string;
  @Field({ nullable: true }) phoneNumber?: string;
  @Field({ nullable: true }) email?: string;
  @Field(() => Float, { defaultValue: 0 }) dailySalesTarget?: number;
  @Field(() => Float, { defaultValue: 0 }) monthlySalesTarget?: number;
  @Field({ nullable: true }) storeType?: string;
}
