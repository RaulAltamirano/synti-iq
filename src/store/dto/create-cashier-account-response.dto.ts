import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class CreateCashierAccountResponseDto {
  @ApiProperty({ description: 'Created cashier user (password never included)' })
  user: User;

  @ApiProperty({
    description:
      'True when an invitation token was created (email may be skipped if mail is not configured)',
    example: true,
  })
  invitationSent: boolean;
}
