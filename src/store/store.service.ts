import { Injectable } from '@nestjs/common';
import { Store } from './entities/store.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateCashierAccountDto } from './dto/create-cashier-account.dto';
import { CreateCashierAccountResponseDto } from './dto/create-cashier-account-response.dto';
import { CreateUnassignedCashierAccountDto } from 'src/cashier-profile/dto/create-unassigned-cashier-account.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { StoreFilterDto } from './dto/filter-store-dto';
import { FilterStoreCashiersDto } from './dto/filter-store-cashiers.dto';
import { StoreQueryService } from './services/store-query.service';
import { StoreMutationService } from './services/store-mutation.service';
import { StoreCashierService } from './services/store-cashier.service';

@Injectable()
export class StoreService {
  constructor(
    private readonly storeQueryService: StoreQueryService,
    private readonly storeMutationService: StoreMutationService,
    private readonly storeCashierService: StoreCashierService,
  ) {}

  async findAll(filters: StoreFilterDto, userId?: string): Promise<PaginatedResponse<Store>> {
    return this.storeQueryService.findAll(filters, userId);
  }

  async findOne(id: string, userId?: string): Promise<Store> {
    return this.storeQueryService.findOne(id, userId);
  }

  async validateStore(storeId: string): Promise<Store> {
    return this.storeQueryService.validateStore(storeId);
  }

  async create(input: CreateStoreDto, userId: string): Promise<Store> {
    return this.storeMutationService.create(input, userId);
  }

  async remove(id: string, userId?: string): Promise<void> {
    return this.storeMutationService.remove(id, userId);
  }

  async getCashiersFromStorePaginated(
    storeId: string,
    filters: FilterStoreCashiersDto,
    userId?: string,
  ): Promise<PaginatedResponse<CashierProfile>> {
    return this.storeCashierService.getCashiersFromStorePaginated(storeId, filters, userId);
  }

  async createCashierUserForStore(
    storeId: string,
    dto: CreateCashierAccountDto,
    ownerUserId: string,
  ): Promise<CreateCashierAccountResponseDto> {
    return this.storeCashierService.createCashierUserForStore(storeId, dto, ownerUserId);
  }

  async createUnassignedCashierForBusiness(
    dto: CreateUnassignedCashierAccountDto,
    ownerUserId: string,
  ): Promise<CreateCashierAccountResponseDto> {
    return this.storeCashierService.createUnassignedCashierForBusiness(dto, ownerUserId);
  }

  async assignCashierToStore(
    storeId: string,
    cashierId: string,
    userId?: string,
  ): Promise<boolean> {
    return this.storeCashierService.assignCashierToStore(storeId, cashierId, userId);
  }

  async getCashiersFromStore(storeId: string, userId?: string): Promise<CashierProfile[]> {
    return this.storeCashierService.getCashiersFromStore(storeId, userId);
  }

  async removeCashiersFromStore(
    storeId: string,
    cashierIds: string[],
    userId?: string,
  ): Promise<{ removed: number }> {
    return this.storeCashierService.removeCashiersFromStore(storeId, cashierIds, userId);
  }
}
