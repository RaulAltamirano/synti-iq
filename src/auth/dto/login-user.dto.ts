import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  Length,
} from 'class-validator';
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
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number',
  })
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
  @Matches(/^(\d{6}|[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4})$/, {
    message: 'Code must be 6-digit TOTP or backup code format XXXX-XXXX-XXXX',
  })
  totpCode?: string;
}
