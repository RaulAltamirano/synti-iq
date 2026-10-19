import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { IsReferralCode } from 'src/auth/validators/is-referral-code.validator';

export class RegisterBusinessDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsOptional()
  @ValidateIf(o => o.referralCode != null && o.referralCode !== '')
  @IsString()
  @IsReferralCode()
  referralCode?: string;
}
