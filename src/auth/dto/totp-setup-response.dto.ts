import { ApiProperty } from '@nestjs/swagger';

export class TotpSetupResponseDto {
  @ApiProperty({
    description: 'Base32 secret for manual entry in authenticator app',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;

  @ApiProperty({
    description: 'Data URL of QR code image for scanning with authenticator app',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  qrCode: string;
}
