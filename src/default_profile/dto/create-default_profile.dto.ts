import { Field, ID } from '@nestjs/graphql';

export class CreateDefaultProfileDto {
  @Field(() => ID)
  userId: string;

  @Field(() => JSON, { nullable: true })
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };

  @Field(() => [ID], { nullable: true })
  wishlist?: string[];

  @Field(() => [ID], { nullable: true })
  viewedProducts?: string[];
}
