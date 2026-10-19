import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorator';
import { ApiDoc } from 'src/shared/decorators';
import { ReferralService } from './referral.service';
import { MyReferralCodeDto } from './dto/my-referral-code.dto';
import { MyReferrerResponseDto } from './dto/referrer-info.dto';
import { ReferralStatsDto } from './dto/referral-record.dto';
import { MyReferralsPaginatedDto } from './dto/my-referrals-paginated.dto';
import { ReferralValidationResponseDto } from './dto/referral-validation-response.dto';
import { ReferralPaginationQueryDto } from './dto/referral-pagination-query.dto';
import { referralEndpoints } from 'src/docs/referral.endpoints';

@ApiTags('Referral')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('me/code')
  @ApiDoc(referralEndpoints, 'getMyCode')
  @Auth('business_owner', [])
  async getMyCode(@GetUser('sub') userId: string): Promise<MyReferralCodeDto> {
    return this.referralService.getMyCode(userId);
  }

  @Post('me/code')
  @HttpCode(HttpStatus.CREATED)
  @ApiDoc(referralEndpoints, 'generateCode')
  @Auth('business_owner', [])
  async generateCode(@GetUser('sub') userId: string): Promise<MyReferralCodeDto> {
    return this.referralService.getMyCode(userId);
  }

  @Get('me/referrer')
  @ApiDoc(referralEndpoints, 'getMyReferrer')
  @Auth('', [])
  async getMyReferrer(@GetUser('sub') userId: string): Promise<MyReferrerResponseDto> {
    return this.referralService.getMyReferrer(userId);
  }

  @Get('me/stats')
  @ApiDoc(referralEndpoints, 'getMyReferralsStats')
  @Auth('business_owner', [])
  async getMyReferralsStats(@GetUser('sub') userId: string): Promise<ReferralStatsDto> {
    return this.referralService.getMyReferralsStats(userId);
  }

  @Get('me')
  @ApiDoc(referralEndpoints, 'getMyReferrals')
  @Auth('business_owner', [])
  async getMyReferrals(
    @GetUser('sub') userId: string,
    @Query() query: ReferralPaginationQueryDto,
  ): Promise<MyReferralsPaginatedDto> {
    return this.referralService.getMyReferrals(userId, query.page ?? 1, query.limit ?? 20);
  }

  @Get('validate/:code')
  @ApiDoc(referralEndpoints, 'validateCode')
  async validateCode(@Param('code') code: string): Promise<ReferralValidationResponseDto> {
    return this.referralService.validateCode(code);
  }
}
