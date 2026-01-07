import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TransactionsService } from './transactions.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';

@Resolver('Transaction')
export class TransactionsResolver {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Mutation('createTransaction')
  create(
    @Args('createTransactionInput')
    createTransactionInput: CreateTransactionInput,
  ) {
    return this.transactionsService.create(createTransactionInput);
  }

  @Query('transactions')
  findAll() {
    return this.transactionsService.findAll();
  }

  @Query('transaction')
  findOne(@Args('id') id: number) {
    return this.transactionsService.findOne(id);
  }

  @Mutation('updateTransaction')
  update(
    @Args('updateTransactionInput')
    updateTransactionInput: UpdateTransactionInput,
  ) {
    return this.transactionsService.update(updateTransactionInput.id, updateTransactionInput);
  }

  @Mutation('removeTransaction')
  remove(@Args('id') id: number) {
    return this.transactionsService.remove(id);
  }
}
