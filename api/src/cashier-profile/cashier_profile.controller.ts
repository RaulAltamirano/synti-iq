import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth-decorator';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { ApiDoc } from 'src/shared/decorators';
import { SystemRole } from 'src/shared/enums/roles.enum';
import { StoreService } from 'src/store/store.service';
import { cashierProfileEndpoints } from 'src/docs/cashier-profile.endpoints';
import { CreateUnassignedCashierAccountDto } from './dto/create-unassigned-cashier-account.dto';
import { CreateCashierAccountResponseDto } from 'src/store/dto/create-cashier-account-response.dto';

@ApiTags('Cashier')
@Controller('cashiers')
@UseInterceptors(ClassSerializerInterceptor)
export class CashierProfileController {
  constructor(private readonly storeService: StoreService) {}

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  @Auth(SystemRole.BUSINESS_OWNER, [])
  @ApiDoc(cashierProfileEndpoints, 'createUnassignedCashierAccount')
  async createUnassignedCashierAccount(
    @Body() dto: CreateUnassignedCashierAccountDto,
    @GetUser('sub') ownerUserId: string,
  ): Promise<CreateCashierAccountResponseDto> {
    return this.storeService.createUnassignedCashierForBusiness(dto, ownerUserId);
  }
}
