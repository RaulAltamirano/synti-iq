import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Store } from './entities/store.entity';
import { StoreService } from './store.service';
import { CreateStoreInput } from './dto/create-store.input.ts';
import { UpdateStoreInput } from './dto/update-store.input';

@Resolver(() => Store)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  @Query(() => [Store], { name: 'stores' })
  findAll() {}

  @Query(() => Store, { name: 'store' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.storeService.findOne(id);
  }

  @Mutation(() => Boolean)
  deleteStore(@Args('id', { type: () => String }) id: string) {
    return this.storeService.remove(id);
  }
}
