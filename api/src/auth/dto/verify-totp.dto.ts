import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { IsTotpOrBackupCode } from 'src/auth/validators/is-totp-or-backup-code.validator';

export class VerifyTotpDto {
  @ApiProperty({
    description:
      '6-digit TOTP code from authenticator app, or backup code (XXXX-XXXX-XXXX) for disable',
    example: '123456',
    minLength: 6,
    maxLength: 14,
  })
  @IsString()
  @Length(6, 14)
  @IsTotpOrBackupCode()
  code: string;
}
