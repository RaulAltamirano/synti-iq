import { Injectable } from '@nestjs/common';
import { CreateCashRegisterSessionInput } from './dto/create-cash_register_session.input';
import { UpdateCashRegisterSessionInput } from './dto/update-cash_register_session.input';

@Injectable()
export class CashRegisterSessionsService {
  create(createCashRegisterSessionInput: CreateCashRegisterSessionInput) {
    return 'This action adds a new cashRegisterSession';
  }

  findAll() {
    return `This action returns all cashRegisterSessions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cashRegisterSession`;
  }

  update(id: number, updateCashRegisterSessionInput: UpdateCashRegisterSessionInput) {
    return `This action updates a #${id} cashRegisterSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashRegisterSession`;
  }
}
