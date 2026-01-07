import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DeliveryProfilesService } from './delivery_profiles.service';
import { CreateDeliveryProfileInput } from './dto/create-delivery_profile.input';
import { UpdateDeliveryProfileInput } from './dto/update-delivery_profile.input';

@Resolver('DeliveryProfile')
export class DeliveryProfilesResolver {
  constructor(private readonly deliveryProfilesService: DeliveryProfilesService) {}

  @Mutation('createDeliveryProfile')
  create(
    @Args('createDeliveryProfileInput')
    createDeliveryProfileInput: CreateDeliveryProfileInput,
  ) {
    return this.deliveryProfilesService.create(createDeliveryProfileInput);
  }

  @Query('deliveryProfiles')
  findAll() {
    return this.deliveryProfilesService.findAll();
  }

  @Query('deliveryProfile')
  findOne(@Args('id') id: number) {
    return this.deliveryProfilesService.findOne(id);
  }

  @Mutation('updateDeliveryProfile')
  update(
    @Args('updateDeliveryProfileInput')
    updateDeliveryProfileInput: UpdateDeliveryProfileInput,
  ) {
    return this.deliveryProfilesService.update(
      updateDeliveryProfileInput.id,
      updateDeliveryProfileInput,
    );
  }

  @Mutation('removeDeliveryProfile')
  remove(@Args('id') id: number) {
    return this.deliveryProfilesService.remove(id);
  }
}
