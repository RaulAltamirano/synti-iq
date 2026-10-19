import { IsBoolean, IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReferralBenefitsDto {
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

export class ReferralValidationResponseDto {
  @IsBoolean()
  isValid: boolean;

  @IsOptional()
  @IsString()
  referrerName?: string;

  @IsOptional()
  @IsString()
  referrerEmail?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferralBenefitsDto)
  benefits?: ReferralBenefitsDto;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  referralCodeId?: string;
}
