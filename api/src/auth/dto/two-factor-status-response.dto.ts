import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorStatusResponseDto {
  @ApiProperty({
    description: 'Whether 2FA is enabled for the user',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: '2FA method when enabled (authenticator only for TOTP)',
    example: 'authenticator',
    nullable: true,
  })
  method: 'authenticator' | null;

  @ApiProperty({
    description: 'Number of backup codes remaining',
    example: 8,
    required: false,
  })
  backupCodesRemaining?: number;
}
