import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { StoreService } from './store.service';
import { StoreQueryService } from './services/store-query.service';
import { StoreMutationService } from './services/store-mutation.service';
import { StoreCashierService } from './services/store-cashier.service';

describe('StoreService (facade)', () => {
  let service: StoreService;
  let queryService: jest.Mocked<Pick<StoreQueryService, 'findAll' | 'findOne' | 'validateStore'>>;
  let mutationService: jest.Mocked<Pick<StoreMutationService, 'create' | 'remove'>>;
  let cashierService: jest.Mocked<
    Pick<
      StoreCashierService,
      | 'getCashiersFromStorePaginated'
      | 'createCashierUserForStore'
      | 'createUnassignedCashierForBusiness'
      | 'assignCashierToStore'
      | 'removeCashiersFromStore'
    >
  >;

  beforeEach(async () => {
    queryService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      validateStore: jest.fn(),
    };
    mutationService = {
      create: jest.fn(),
      remove: jest.fn(),
    };
    cashierService = {
      getCashiersFromStorePaginated: jest.fn(),
      createCashierUserForStore: jest.fn(),
      createUnassignedCashierForBusiness: jest.fn(),
      assignCashierToStore: jest.fn(),
      removeCashiersFromStore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: StoreQueryService, useValue: queryService },
        { provide: StoreMutationService, useValue: mutationService },
        { provide: StoreCashierService, useValue: cashierService },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll delegates to StoreQueryService', async () => {
    const filters = {} as never;
    await service.findAll(filters, 'user-1');
    expect(queryService.findAll).toHaveBeenCalledWith(filters, 'user-1');
  });

  it('findOne delegates to StoreQueryService', async () => {
    await service.findOne('store-1', 'user-1');
    expect(queryService.findOne).toHaveBeenCalledWith('store-1', 'user-1');
  });

  it('validateStore delegates to StoreQueryService', async () => {
    await service.validateStore('store-1');
    expect(queryService.validateStore).toHaveBeenCalledWith('store-1');
  });

  it('create delegates to StoreMutationService', async () => {
    const dto = { name: 'S1' } as never;
    await service.create(dto, 'owner-1');
    expect(mutationService.create).toHaveBeenCalledWith(dto, 'owner-1');
  });

  it('remove delegates to StoreMutationService', async () => {
    await service.remove('store-1', 'owner-1');
    expect(mutationService.remove).toHaveBeenCalledWith('store-1', 'owner-1');
  });

  it('getCashiersFromStorePaginated delegates to StoreCashierService', async () => {
    const filters = { page: 1, limit: 10, sortBy: 'cashierNumber', sortOrder: 'ASC' } as never;
    await service.getCashiersFromStorePaginated('store-1', filters, 'user-1');
    expect(cashierService.getCashiersFromStorePaginated).toHaveBeenCalledWith(
      'store-1',
      filters,
      'user-1',
    );
  });

  it('createCashierUserForStore delegates to StoreCashierService', async () => {
    const dto = { email: 'c@e.com' } as never;
    await service.createCashierUserForStore('store-1', dto, 'owner-1');
    expect(cashierService.createCashierUserForStore).toHaveBeenCalledWith(
      'store-1',
      dto,
      'owner-1',
    );
  });

  it('assignCashierToStore delegates to StoreCashierService', async () => {
    await service.assignCashierToStore('store-1', 'cashier-1', 'user-1');
    expect(cashierService.assignCashierToStore).toHaveBeenCalledWith(
      'store-1',
      'cashier-1',
      'user-1',
    );
  });

  it('removeCashiersFromStore delegates to StoreCashierService', async () => {
    await service.removeCashiersFromStore('store-1', ['c-1'], 'user-1');
    expect(cashierService.removeCashiersFromStore).toHaveBeenCalledWith(
      'store-1',
      ['c-1'],
      'user-1',
    );
  });
});
