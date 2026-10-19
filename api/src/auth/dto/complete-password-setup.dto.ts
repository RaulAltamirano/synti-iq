import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsPasswordComplex } from 'src/auth/validators/is-password-complex.validator';

export class CompletePasswordSetupDto {
  @ApiProperty({
    description: 'Opaque invitation token from the email link (single use)',
    minLength: 32,
  })
  @IsString()
  @MinLength(32)
  @MaxLength(512)
  token: string;

  @ApiProperty({
    description: 'New password (complexity rules apply)',
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
}
