import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AssignCashierInput {
  @Field(() => ID) storeId: string;
  @Field(() => ID) cashierId: string;
}
