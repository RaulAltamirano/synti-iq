import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsObject,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TotalBenefitsEarnedDto {
  @IsOptional()
  @IsNumber()
  trialDays?: number;

  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ReferralRecordDto {
  @IsString()
  userId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsDate()
  registeredAt: Date;

  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}

export class ReferralStatsDto {
  @IsNumber()
  totalReferrals: number;

  @IsNumber()
  successfulReferrals: number;

  @IsNumber()
  pendingReferrals: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TotalBenefitsEarnedDto)
  totalBenefitsEarned?: TotalBenefitsEarnedDto;
}
