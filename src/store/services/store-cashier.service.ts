import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { UserProfile } from 'src/user-profile/entities/user_profile.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserProfileService } from 'src/user-profile/user_profile.service';
import { AccountInvitationService } from 'src/auth/account-invitation/account-invitation.service';
import { MailService } from 'src/mail/mail.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { FilterStoreCashiersDto } from 'src/store/dto/filter-store-cashiers.dto';
import { CreateCashierAccountDto } from 'src/store/dto/create-cashier-account.dto';
import { CreateCashierAccountResponseDto } from 'src/store/dto/create-cashier-account-response.dto';
import { CreateUnassignedCashierAccountDto } from 'src/cashier-profile/dto/create-unassigned-cashier-account.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { STORE_SPAN_ATTRIBUTES, STORE_SPAN_NAMES } from 'src/store/constants';
import { StoreQueryService } from './store-query.service';

const CASHIER_SORT_COLUMN_MAP: Record<string, string> = {
  id: 'id',
  cashierNumber: 'cashierNumber',
  branchOffice: 'branchOffice',
  lastActivityAt: 'lastActivityAt',
  isApproved: 'isApproved',
};

@Injectable()
export class StoreCashierService {
  private readonly logger = new Logger(StoreCashierService.name);

  constructor(
    @InjectRepository(CashierProfile)
    private readonly cashierRepo: Repository<CashierProfile>,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly accountInvitationService: AccountInvitationService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly observabilityService: ObservabilityService,
    private readonly storeQueryService: StoreQueryService,
  ) {}

  async getCashiersFromStorePaginated(
    storeId: string,
    filters: FilterStoreCashiersDto,
    userId?: string,
  ): Promise<PaginatedResponse<CashierProfile>> {
    return this.observabilityService.withSpan(STORE_SPAN_NAMES.FIND_STORE_CASHIERS, async span => {
      span.setAttribute(STORE_SPAN_ATTRIBUTES.STORE_ID, storeId);

      await this.storeQueryService.findOne(storeId, userId);

      const queryBuilder = this.cashierRepo
        .createQueryBuilder('cashier')
        .leftJoin(
          UserProfile,
          'up',
          'up.profile_id = cashier.id AND up.profile_type = :profileType',
          { profileType: SystemRole.CASHIER },
        )
        .leftJoinAndMapOne('cashier.user', User, 'u', 'u.id = up."userId"')
        .where('cashier.storeId = :storeId', { storeId });

      const response = await PaginationCacheUtil.paginateQueryBuilder(queryBuilder, filters, {
        columnMap: CASHIER_SORT_COLUMN_MAP,
        aliasOverride: 'cashier',
      });

      span.setAttribute(STORE_SPAN_ATTRIBUTES.PAGE, response.page);
      span.setAttribute(STORE_SPAN_ATTRIBUTES.LIMIT, response.limit);
      span.setAttribute(STORE_SPAN_ATTRIBUTES.TOTAL, response.total);

      return response;
    });
  }

  async getCashiersFromStore(storeId: string, userId?: string): Promise<CashierProfile[]> {
    await this.storeQueryService.findOne(storeId, userId);
    return this.cashierRepo.find({
      where: { storeId },
      order: { cashierNumber: 'ASC' },
    });
  }

  async createCashierUserForStore(
    storeId: string,
    dto: CreateCashierAccountDto,
    ownerUserId: string,
  ): Promise<CreateCashierAccountResponseDto> {
    const store = await this.storeQueryService.findOne(storeId, ownerUserId);

    const createUserDto: CreateUserDto = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: SystemRole.CASHIER,
      actingBusinessProfileId: store.businessProfileId,
      pendingPasswordSetup: true,
      profileData: {
        storeId,
        branchOffice: dto.branchOffice,
        cashierNumber: dto.cashierNumber,
        shiftStartTime: dto.shiftStartTime,
        shiftEndTime: dto.shiftEndTime,
      },
    };

    const user = await this.userService.create(createUserDto);
    await this.sendCashierInvitationForNewUser(user);
    await this.storeQueryService.invalidateListCache();

    return { user, invitationSent: true };
  }

  async createUnassignedCashierForBusiness(
    dto: CreateUnassignedCashierAccountDto,
    ownerUserId: string,
  ): Promise<CreateCashierAccountResponseDto> {
    const profile = await this.userProfileService.getUserProfile(ownerUserId);
    if (!profile?.profileId || profile.profileType !== SystemRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can create cashier accounts');
    }

    const createUserDto: CreateUserDto = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: SystemRole.CASHIER,
      actingBusinessProfileId: profile.profileId,
      pendingPasswordSetup: true,
      profileData: {
        branchOffice: dto.branchOffice,
        cashierNumber: dto.cashierNumber,
        shiftStartTime: dto.shiftStartTime,
        shiftEndTime: dto.shiftEndTime,
      },
    };

    const user = await this.userService.create(createUserDto);
    await this.sendCashierInvitationForNewUser(user);

    return { user, invitationSent: true };
  }

  async assignCashierToStore(
    storeId: string,
    cashierId: string,
    userId?: string,
  ): Promise<boolean> {
    const store = await this.storeQueryService.findOne(storeId, userId);

    const cashier = await this.cashierRepo.findOne({
      where: { id: cashierId },
      relations: ['store'],
    });
    if (!cashier) {
      throw new NotFoundException('Cashier not found');
    }

    const cashierBusinessProfileId = cashier.store?.businessProfileId;
    if (
      cashierBusinessProfileId !== undefined &&
      cashierBusinessProfileId !== null &&
      cashierBusinessProfileId !== store.businessProfileId
    ) {
      throw new ForbiddenException('Cashier does not belong to this business');
    }

    cashier.store = store;
    cashier.storeId = store.id;
    await this.cashierRepo.save(cashier);

    return true;
  }

  async removeCashiersFromStore(
    storeId: string,
    cashierIds: string[],
    userId?: string,
  ): Promise<{ removed: number }> {
    await this.storeQueryService.findOne(storeId, userId);

    if (cashierIds.length === 0) {
      return { removed: 0 };
    }

    const uniqueIds = [...new Set(cashierIds)];
    const result = await this.cashierRepo.softDelete({
      id: In(uniqueIds),
      storeId,
    });
    await this.storeQueryService.invalidateListCache();

    return { removed: result.affected ?? 0 };
  }

  private async sendCashierInvitationForNewUser(user: User): Promise<void> {
    const ttlHours = Number(this.configService.get<string>('CASHIER_INVITATION_TTL_HOURS') ?? 48);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    const { rawToken } = await this.accountInvitationService.createForUser(user.id, expiresAt);
    const appUrl = (
      this.configService.get<string>('FRONTEND_URL') ?? 'https://app.syntiiq.com'
    ).replace(/\/$/, '');
    const setPasswordUrl = `${appUrl}/auth/set-password?token=${encodeURIComponent(rawToken)}`;
    await this.mailService.sendCashierInvitation({
      email: user.email,
      firstName: user.firstName,
      setPasswordUrl,
    });
  }
}
