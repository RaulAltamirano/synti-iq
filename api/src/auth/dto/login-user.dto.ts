import { IsString, IsEmail, MinLength, MaxLength, IsOptional, Length } from 'class-validator';
import { IsPasswordComplex } from 'src/auth/validators/is-password-complex.validator';
import { IsTotpOrBackupCode } from 'src/auth/validators/is-totp-or-backup-code.validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password (uppercase, lowercase, and number required)',
    example: 'SecurePass123',
    minLength: 6,
    maxLength: 50,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsPasswordComplex()
  password: string;

  @ApiProperty({
    description:
      'TOTP code (6 digits) or backup code (XXXX-XXXX-XXXX) required when 2FA is enabled',
    example: '123456',
    minLength: 6,
    maxLength: 14,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(6, 14)
  @IsTotpOrBackupCode()
  totpCode?: string;
}
