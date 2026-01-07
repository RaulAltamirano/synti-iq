import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateStoreInput } from './create-store.input.ts';

@InputType()
export class UpdateStoreInput extends PartialType(CreateStoreInput) {
  @Field(() => ID) id: string;
}
