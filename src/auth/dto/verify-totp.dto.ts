import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

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
  @Matches(/^(\d{6}|[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4})$/, {
    message: 'Code must be 6-digit TOTP or backup code format XXXX-XXXX-XXXX',
  })
  code: string;
}
