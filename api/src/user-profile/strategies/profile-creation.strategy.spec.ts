import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CashierProfileStrategy } from './profile-creation.strategy';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import type { QueryRunner } from 'typeorm';

describe('CashierProfileStrategy', () => {
  let strategy: CashierProfileStrategy;
  let mockManager: {
    findOne: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CashierProfileStrategy,
        {
          provide: getRepositoryToken(CashierProfile),
          useValue: {
            create: jest.fn(dto => dto),
          },
        },
      ],
    }).compile();

    strategy = moduleRef.get(CashierProfileStrategy);
  });

  function makeQueryRunner(): QueryRunner {
    return { manager: mockManager } as unknown as QueryRunner;
  }

  it('throws NotFoundException when store does not exist', async () => {
    mockManager.findOne.mockResolvedValueOnce(null);

    await expect(
      strategy.create(
        {
          storeId: '00000000-0000-4000-8000-000000000001',
          branchOffice: 'A',
          cashierNumber: '1',
          actingBusinessProfileId: '00000000-0000-4000-8000-000000000002',
        },
        makeQueryRunner(),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when acting business profile does not match store', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      id: 'store-1',
      businessProfileId: 'bp-correct',
    });

    await expect(
      strategy.create(
        {
          storeId: 'store-1',
          branchOffice: 'A',
          cashierNumber: '1',
          actingBusinessProfileId: 'bp-wrong',
        },
        makeQueryRunner(),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws ForbiddenException when actingBusinessProfileId is missing', async () => {
    await expect(
      strategy.create(
        {
          storeId: 'store-1',
          branchOffice: 'A',
          cashierNumber: '1',
        },
        makeQueryRunner(),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(mockManager.findOne).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when storeId is absent and actingBusinessProfileId is missing', async () => {
    await expect(
      strategy.create({ branchOffice: 'A', cashierNumber: '1' }, makeQueryRunner()),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(mockManager.findOne).not.toHaveBeenCalled();
  });

  it('creates cashier without store when storeId is absent', async () => {
    const businessProfileId = '00000000-0000-4000-8000-000000000099';
    mockManager.save.mockResolvedValue({ id: 'unassigned-cashier-id' });
    mockManager.findOne.mockResolvedValueOnce({ id: 'unassigned-cashier-id' });

    const id = await strategy.create(
      {
        branchOffice: 'Branch A',
        cashierNumber: '10',
        actingBusinessProfileId: businessProfileId,
      },
      makeQueryRunner(),
    );

    expect(id).toBe('unassigned-cashier-id');
    expect(mockManager.save).toHaveBeenCalled();
    expect(mockManager.findOne).toHaveBeenCalledTimes(1);
  });

  it('persists when store matches acting business profile', async () => {
    const store = {
      id: '00000000-0000-4000-8000-000000000010',
      businessProfileId: '00000000-0000-4000-8000-000000000020',
    };
    mockManager.findOne
      .mockResolvedValueOnce(store)
      .mockResolvedValueOnce({ id: 'new-cashier-id' });
    mockManager.save.mockResolvedValue({ id: 'new-cashier-id' });

    const id = await strategy.create(
      {
        storeId: store.id,
        branchOffice: 'Main',
        cashierNumber: '99',
        actingBusinessProfileId: store.businessProfileId,
      },
      makeQueryRunner(),
    );

    expect(id).toBe('new-cashier-id');
    expect(mockManager.save).toHaveBeenCalled();
  });
});
