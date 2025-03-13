import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CashRegisterSessionsService } from './cash_register_sessions.service';
import { CreateCashRegisterSessionInput } from './dto/create-cash_register_session.input';
import { UpdateCashRegisterSessionInput } from './dto/update-cash_register_session.input';

@Resolver('CashRegisterSession')
export class CashRegisterSessionsResolver {
  constructor(private readonly cashRegisterSessionsService: CashRegisterSessionsService) {}

  @Mutation('createCashRegisterSession')
  create(@Args('createCashRegisterSessionInput') createCashRegisterSessionInput: CreateCashRegisterSessionInput) {
    return this.cashRegisterSessionsService.create(createCashRegisterSessionInput);
  }

  @Query('cashRegisterSessions')
  findAll() {
    return this.cashRegisterSessionsService.findAll();
  }

  @Query('cashRegisterSession')
  findOne(@Args('id') id: number) {
    return this.cashRegisterSessionsService.findOne(id);
  }

  @Mutation('updateCashRegisterSession')
  update(@Args('updateCashRegisterSessionInput') updateCashRegisterSessionInput: UpdateCashRegisterSessionInput) {
    return this.cashRegisterSessionsService.update(updateCashRegisterSessionInput.id, updateCashRegisterSessionInput);
  }

  @Mutation('removeCashRegisterSession')
  remove(@Args('id') id: number) {
    return this.cashRegisterSessionsService.remove(id);
  }
}
