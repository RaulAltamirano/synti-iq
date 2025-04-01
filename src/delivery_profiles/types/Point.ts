import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Point {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}
