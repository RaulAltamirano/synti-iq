import { Inject, Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/components';
import { createElement } from 'react';
import { Resend } from 'resend';
import { WelcomeBusiness } from './templates/welcome-business';
import { WelcomeBusinessMailParams } from './interfaces/welcome-business-mail.interface';

export const MAIL_OPTIONS = 'MAIL_OPTIONS';

/**
 * Normalizes email for Resend sandbox: strips +suffix (e.g. user+test@gmail.com → user@gmail.com).
 * Resend sandbox only accepts the exact signup email; Gmail delivers both to the same inbox.
 */
function normalizeEmailForResend(email: string): string {
  const match = email.match(/^([^+]+)\+[^@]+(@.+)$/);
  return match ? `${match[1]}${match[2]}` : email;
}

export interface MailModuleOptions {
  apiKey: string;
  from: string;
}

export interface MailServiceOptions {
  resend: Resend | null;
  from: string;
  appUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(MAIL_OPTIONS)
    private readonly options: MailServiceOptions,
  ) {}

  async sendWelcomeBusiness(params: WelcomeBusinessMailParams): Promise<void> {
    if (!this.options.resend) {
      this.logger.warn('RESEND_API_KEY not configured. Skipping welcome email.');
      return;
    }

    try {
      const html = await render(
        createElement(WelcomeBusiness, {
          firstName: params.firstName,
          businessName: params.businessName,
          appUrl: this.options.appUrl,
        }),
        { pretty: true },
      );
      const toAddress = normalizeEmailForResend(params.email);

      const result = await this.options.resend.emails.send({
        from: this.options.from,
        to: toAddress,
        subject: 'Welcome to Synti-IQ - Your business account is ready',
        html,
      });

      if (result.error) {
        this.logger.error(`Resend API error for ${params.email}: ${result.error.message}`);
        return;
      }

      this.logger.log(`Welcome email sent to ${params.email} (id: ${result.data?.id})`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${params.email}: ${(error as Error).message}`,
      );
    }
  }
}
