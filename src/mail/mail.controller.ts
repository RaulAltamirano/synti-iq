import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { TestWelcomeDto } from './dto/test-welcome.dto';

/**
 * Dev-only controller to test welcome email without registering.
 * Returns 404 in production.
 */
@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test-welcome')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[Dev only] Send test welcome email',
    description:
      'Sends the welcome business email. Only available when NODE_ENV=development. Use to test without registering.',
  })
  async testWelcome(@Body() dto: TestWelcomeDto): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException();
    }

    await this.mailService.sendWelcomeBusiness({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      businessName: dto.businessName,
    });
  }
}
