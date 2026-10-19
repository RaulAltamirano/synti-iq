import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountInvitationService } from './account-invitation.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ApiDoc } from 'src/shared/decorators';
import { accountInvitationEndpoints } from 'src/docs/account-invitation.endpoints';

@ApiTags('Invitations')
@Controller('invitations')
export class AccountInvitationController {
  constructor(private readonly accountInvitationService: AccountInvitationService) {}

  @ApiDoc(accountInvitationEndpoints, 'acceptInvitation')
  @Post('accept')
  @HttpCode(200)
  async accept(@Body() dto: AcceptInvitationDto): Promise<{ message: string }> {
    await this.accountInvitationService.consumeInvitation(dto.token, dto.password);
    return { message: 'Password set successfully' };
  }
}
