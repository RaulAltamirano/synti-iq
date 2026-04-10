import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashierProfile } from './entities/cashier_profile.entity';

@Injectable()
export class CashierProfileService {
  constructor(
    @InjectRepository(CashierProfile)
    private readonly cashierRepo: Repository<CashierProfile>,
  ) {}

  public async validateCashier(cashierId: string): Promise<CashierProfile> {
    if (!cashierId) {
      throw new BadRequestException('Cashier ID is required');
    }

    const cashier = await this.cashierRepo.findOne({
      where: { id: cashierId },
    });

    if (!cashier) {
      throw new NotFoundException(`Cashier with ID ${cashierId} not found`);
    }

    return cashier;
  }
}
