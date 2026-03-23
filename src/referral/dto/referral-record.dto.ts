import { IsString, IsOptional, IsDate, IsNumber, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({ description: 'User UUID' })
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Registration date' })
  @IsDate()
  registeredAt: Date;

  @ApiProperty({ enum: ['active', 'inactive'] })
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
