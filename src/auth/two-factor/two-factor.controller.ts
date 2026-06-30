import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorator';
import { TwoFactorService } from './two-factor.service';
import { VerifyTotpDto } from 'src/auth/dto/verify-totp.dto';
import { ApiDoc } from 'src/shared/decorators';
import { twoFactorEndpoints } from 'src/docs/two-factor.endpoints';

@ApiTags('Two-Factor Auth')
@ApiCookieAuth('access_token')
@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @ApiDoc(twoFactorEndpoints, 'twoFactorSetup')
  @Auth('', [])
  @Post('setup')
  @HttpCode(200)
  async setup(@GetUser('sub') userId: string) {
    return this.twoFactorService.generateSecretForUserId(userId);
  }

  @ApiDoc(twoFactorEndpoints, 'twoFactorVerify')
  @Auth('', [])
  @Post('verify')
  @HttpCode(200)
  async verify(@GetUser('sub') userId: string, @Body() dto: VerifyTotpDto) {
    return this.twoFactorService.verifyAndActivateForUserId(userId, dto.code);
  }

  @ApiDoc(twoFactorEndpoints, 'twoFactorDisable')
  @Auth('', [])
  @Post('disable')
  @HttpCode(200)
  async disable(@GetUser('sub') userId: string, @Body() dto: VerifyTotpDto) {
    await this.twoFactorService.disable(userId, dto.code);
    return { message: '2FA disabled successfully' };
  }

  @ApiDoc(twoFactorEndpoints, 'twoFactorStatus')
  @Auth('', [])
  @Get('status')
  async status(@GetUser('sub') userId: string) {
    return this.twoFactorService.getStatusForUserId(userId);
  }

  @ApiDoc(twoFactorEndpoints, 'twoFactorRegenerateBackupCodes')
  @Auth('', [])
  @Post('backup-codes/regenerate')
  @HttpCode(200)
  async regenerateBackupCodes(@GetUser('sub') userId: string) {
    const backupCodes = await this.twoFactorService.regenerateBackupCodesIfEnabled(userId);
    return { backupCodes };
  }
}
