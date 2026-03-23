import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { MailServiceOptions } from './mail.service';
import { MailService, MAIL_OPTIONS } from './mail.service';

jest.mock('@react-email/components', () => ({
  render: jest.fn().mockResolvedValue('<html>mock</html>'),
}));

describe('MailService', () => {
  let service: MailService;
  let mockResend: { emails: { send: jest.Mock } };

  const defaultParams = {
    email: 'owner@business.com',
    firstName: 'John',
    lastName: 'Doe',
    businessName: 'My Business',
  };

  beforeEach(async () => {
    mockResend = {
      emails: { send: jest.fn().mockResolvedValue({ data: { id: 'msg_123' } }) },
    };
  });

  describe('when RESEND_API_KEY is not configured', () => {
    beforeEach(async () => {
      const options: MailServiceOptions = {
        resend: null,
        from: 'noreply@syntiiq.com',
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService, { provide: MAIL_OPTIONS, useValue: options }],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    it('does not call Resend and returns without error', async () => {
      await service.sendWelcomeBusiness(defaultParams);
      expect(mockResend.emails.send).not.toHaveBeenCalled();
    });
  });

  describe('when RESEND_API_KEY is configured', () => {
    beforeEach(async () => {
      const options: MailServiceOptions = {
        resend: mockResend as unknown as MailServiceOptions['resend'],
        from: 'onboarding@resend.dev',
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService, { provide: MAIL_OPTIONS, useValue: options }],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    it('calls resend.emails.send with correct params', async () => {
      await service.sendWelcomeBusiness(defaultParams);

      expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
      const call = mockResend.emails.send.mock.calls[0][0];
      expect(call.from).toBe('onboarding@resend.dev');
      expect(call.to).toBe('owner@business.com');
      expect(call.subject).toBe('Welcome to Synti-IQ - Your business account is ready');
      expect(call.html).toBeDefined();
      expect(typeof call.html).toBe('string');
      expect(call.attachments).toHaveLength(1);
      expect(call.attachments?.[0]).toMatchObject({
        filename: 'logo.png',
        contentId: 'logo-image',
        contentType: 'image/png',
      });
    });

    it('strips +suffix from email for Resend sandbox compatibility', async () => {
      await service.sendWelcomeBusiness({
        ...defaultParams,
        email: 'owner+test123@business.com',
      });

      const call = mockResend.emails.send.mock.calls[0][0];
      expect(call.to).toBe('owner@business.com');
    });

    it('does not rethrow when Resend fails', async () => {
      mockResend.emails.send.mockRejectedValueOnce(new Error('Resend API error'));

      await expect(service.sendWelcomeBusiness(defaultParams)).resolves.not.toThrow();
    });
  });
});
