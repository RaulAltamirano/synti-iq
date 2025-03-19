import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CashierProfileService } from './cashier_profile.service';
import { CreateCashierProfileInput } from './dto/create-cashier_profile.input';
import { UpdateCashierProfileInput } from './dto/update-cashier_profile.input';

@Resolver('CashierProfile')
export class CashierProfileResolver {
  constructor(private readonly cashierProfileService: CashierProfileService) {}

  @Mutation('createCashierProfile')
  create(
    @Args('createCashierProfileInput')
    createCashierProfileInput: CreateCashierProfileInput,
  ) {
    return this.cashierProfileService.create(createCashierProfileInput);
  }

  @Query('cashierProfile')
  findAll() {
    return this.cashierProfileService.findAll();
  }

  @Query('cashierProfile')
  findOne(@Args('id') id: number) {
    return this.cashierProfileService.findOne(id);
  }

  // @Mutation('updateCashierProfile')
  // update(
  //   @Args('updateCashierProfileInput')
  //   updateCashierProfileInput: UpdateCashierProfileInput,
  // ) {
  //   return this.cashierProfileService.update(
  //     updateCashierProfileInput.id,
  //     updateCashierProfileInput,
  //   );
  // }

  @Mutation('removeCashierProfile')
  remove(@Args('id') id: number) {
    return this.cashierProfileService.remove(id);
  }
}
