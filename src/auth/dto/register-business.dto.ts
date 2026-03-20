import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  ValidateIf,
} from 'class-validator';

const REFERRAL_CODE_REGEX = /^[A-Z0-9]{6,12}$/i;

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
  @Matches(REFERRAL_CODE_REGEX, {
    message: 'Referral code must be 6-12 alphanumeric characters',
  })
  referralCode?: string;
}
