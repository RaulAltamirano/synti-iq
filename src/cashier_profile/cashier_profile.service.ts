import { Injectable } from '@nestjs/common';
import { CreateCashierProfileInput } from './dto/create-cashier_profile.input';
import { UpdateCashierProfileInput } from './dto/update-cashier_profile.input';

@Injectable()
export class CashierProfileService {
  create(createCashierProfileInput: CreateCashierProfileInput) {
    return 'This action adds a new cashierProfile';
  }

  findAll() {
    return `This action returns all cashierProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cashierProfile`;
  }

  update(id: number, updateCashierProfileInput: UpdateCashierProfileInput) {
    return `This action updates a #${id} cashierProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashierProfile`;
  }
}
