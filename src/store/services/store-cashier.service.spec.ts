import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FindOperator } from 'typeorm';
import { StoreCashierService } from './store-cashier.service';
import { StoreQueryService } from './store-query.service';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { UserService } from 'src/user/user.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { AccountInvitationService } from 'src/auth/account-invitation/account-invitation.service';
import { MailService } from 'src/mail/mail.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { SystemRole } from 'src/shared/enums/roles.enum';

const buildCashierQueryChain = () => ({
  leftJoin: jest.fn().mockReturnThis(),
  leftJoinAndMapOne: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(1),
  getMany: jest.fn().mockResolvedValue([{ id: 'c-1', cashierNumber: '01' }]),
});

describe('StoreCashierService', () => {
  let service: StoreCashierService;
  let cashierRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let userService: { getUserRole: jest.Mock; create: jest.Mock };
  let userProfileService: { getUserProfile: jest.Mock };
  let storeQueryService: { findOne: jest.Mock; invalidateListCache: jest.Mock };
  let accountInvitationService: { createForUser: jest.Mock };
  let mailService: { sendCashierInvitation: jest.Mock };

  beforeEach(async () => {
    cashierRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockResolvedValue({}),
      softDelete: jest.fn().mockResolvedValue({ affected: 2 }),
      createQueryBuilder: jest.fn(() => buildCashierQueryChain()),
    };
    userService = { getUserRole: jest.fn(), create: jest.fn() };
    userProfileService = { getUserProfile: jest.fn() };
    storeQueryService = {
      findOne: jest.fn(),
      invalidateListCache: jest.fn().mockResolvedValue(undefined),
    };
    accountInvitationService = {
      createForUser: jest.fn().mockResolvedValue({ rawToken: 'raw-token' }),
    };
    mailService = { sendCashierInvitation: jest.fn() };

    const mockObservability: Pick<ObservabilityService, 'withSpan'> = {
      withSpan: jest.fn(<T>(_name: string, fn: (s: unknown) => Promise<T>) =>
        fn({ setAttribute: jest.fn() }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCashierService,
        { provide: getRepositoryToken(CashierProfile), useValue: cashierRepo },
        { provide: UserService, useValue: userService },
        { provide: UserProfileService, useValue: userProfileService },
        { provide: StoreQueryService, useValue: storeQueryService },
        { provide: AccountInvitationService, useValue: accountInvitationService },
        { provide: MailService, useValue: mailService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'CASHIER_INVITATION_TTL_HOURS') return '48';
              if (key === 'FRONTEND_URL') return 'http://localhost:5173';
              return undefined;
            }),
          },
        },
        { provide: ObservabilityService, useValue: mockObservability },
      ],
    }).compile();

    service = module.get<StoreCashierService>(StoreCashierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignCashierToStore', () => {
    it('throws NotFoundException when cashier not found', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 's-1', businessProfileId: 'bp-1' });
      cashierRepo.findOne.mockResolvedValue(null);

      await expect(service.assignCashierToStore('s-1', 'missing-cashier')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when cashier belongs to a different business', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 's-1', businessProfileId: 'bp-1' });
      cashierRepo.findOne.mockResolvedValue({ id: 'c-1', businessProfileId: 'bp-other' });

      await expect(service.assignCashierToStore('s-1', 'c-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('saves cashier with updated storeId on success', async () => {
      const store = { id: 's-1', businessProfileId: 'bp-1' };
      storeQueryService.findOne.mockResolvedValue(store);
      cashierRepo.findOne.mockResolvedValue({ id: 'c-1', businessProfileId: 'bp-1' });

      const result = await service.assignCashierToStore('s-1', 'c-1');

      expect(cashierRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ store, storeId: 's-1' }),
      );
      expect(result).toBe(true);
    });
  });

  describe('createCashierUserForStore', () => {
    it('calls UserService.create with pendingPasswordSetup and sends invitation', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 's-1', businessProfileId: 'bp-1' });
      userService.create.mockResolvedValue({
        id: 'u-new',
        email: 'c@example.com',
        firstName: 'Alice',
      });

      const result = await service.createCashierUserForStore(
        's-1',
        {
          email: 'c@example.com',
          firstName: 'Alice',
          lastName: 'B',
          cashierNumber: '01',
          branchOffice: 'Main',
        },
        'owner-1',
      );

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: SystemRole.CASHIER,
          pendingPasswordSetup: true,
          actingBusinessProfileId: 'bp-1',
        }),
      );
      expect(accountInvitationService.createForUser).toHaveBeenCalledWith(
        'u-new',
        expect.any(Date),
      );
      expect(mailService.sendCashierInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'c@example.com',
          setPasswordUrl: expect.stringContaining('token='),
        }),
      );
      expect(result.invitationSent).toBe(true);
    });
  });

  describe('createUnassignedCashierForBusiness', () => {
    it('throws ForbiddenException when user is not BUSINESS_OWNER', async () => {
      userProfileService.getUserProfile.mockResolvedValue({
        profileId: 'c-id',
        profileType: SystemRole.CASHIER,
      });

      await expect(
        service.createUnassignedCashierForBusiness(
          {
            email: 'c@example.com',
            firstName: 'A',
            lastName: 'B',
            cashierNumber: '01',
            branchOffice: 'Main',
          },
          'user-1',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('removeCashiersFromStore', () => {
    it('returns { removed: 0 } immediately when cashierIds is empty', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 's-1' });

      const result = await service.removeCashiersFromStore('s-1', [], 'user-1');

      expect(cashierRepo.softDelete).not.toHaveBeenCalled();
      expect(result).toEqual({ removed: 0 });
    });

    it('calls softDelete with unique ids and invalidates cache', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 's-1' });

      const result = await service.removeCashiersFromStore('s-1', ['c-1', 'c-2', 'c-1'], 'user-1');

      expect(cashierRepo.softDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(FindOperator),
          storeId: 's-1',
        }),
      );
      // Verify the FindOperator contains the correct values
      const call = cashierRepo.softDelete.mock.calls[0][0];
      expect(call.id._value).toEqual(['c-1', 'c-2']);
      expect(result.removed).toBe(2);
      expect(storeQueryService.invalidateListCache).toHaveBeenCalled();
    });
  });

  describe('getCashiersFromStorePaginated', () => {
    it('returns paginated cashiers and calls storeQueryService.findOne for auth', async () => {
      storeQueryService.findOne.mockResolvedValue({ id: 's-1', businessProfileId: 'bp-1' });

      const result = await service.getCashiersFromStorePaginated(
        's-1',
        { page: 1, limit: 10, sortBy: 'cashierNumber', sortOrder: 'ASC' },
        'user-1',
      );

      expect(storeQueryService.findOne).toHaveBeenCalledWith('s-1', 'user-1');
      expect(cashierRepo.createQueryBuilder).toHaveBeenCalledWith('cashier');
      expect(result.items).toHaveLength(1);
    });
  });
});
