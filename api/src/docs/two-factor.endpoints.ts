import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';
import { TotpSetupResponseDto } from 'src/auth/dto/totp-setup-response.dto';
import { VerifyTotpDto } from 'src/auth/dto/verify-totp.dto';
import { TwoFactorStatusResponseDto } from 'src/auth/dto/two-factor-status-response.dto';

export const twoFactorEndpoints: Record<string, EndpointDocSpec> = {
  twoFactorSetup: {
    summary: 'Start 2FA setup',
    description:
      'Creates a new TOTP secret and QR code for the authenticator app. User must scan the QR code and complete verification with POST /2fa/verify within 5 minutes.',
    operationId: 'twoFactorSetup',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'Setup data returned',
        type: TotpSetupResponseDto,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  twoFactorVerify: {
    summary: 'Verify and activate 2FA',
    description:
      'Verifies the TOTP code from the authenticator app and activates 2FA for the user. Returns backup codes that must be stored securely. Each backup code can only be used once.',
    operationId: 'twoFactorVerify',
    body: VerifyTotpDto,
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: '2FA activated successfully',
        schema: {
          type: 'object',
          properties: {
            backupCodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'One-time backup codes. Store securely.',
            },
          },
        },
      },
      {
        status: 400,
        description: 'Setup expired or not started',
        schema: { $ref: '#/components/schemas/ApiErrorDto' },
      },
      {
        status: 401,
        description: 'Invalid TOTP code',
        schema: { $ref: '#/components/schemas/ApiErrorDto' },
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  twoFactorDisable: {
    summary: 'Disable 2FA',
    description: 'Disables 2FA for the user. Requires current TOTP code or a valid backup code.',
    operationId: 'twoFactorDisable',
    body: VerifyTotpDto,
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: '2FA disabled successfully',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: '2FA disabled successfully' },
          },
        },
      },
      {
        status: 400,
        description: '2FA is not enabled',
        schema: { $ref: '#/components/schemas/ApiErrorDto' },
      },
      {
        status: 401,
        description: 'Invalid TOTP or backup code',
        schema: { $ref: '#/components/schemas/ApiErrorDto' },
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  twoFactorStatus: {
    summary: 'Get 2FA status',
    description: 'Returns whether 2FA is enabled and the number of backup codes remaining.',
    operationId: 'twoFactorStatus',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: '2FA status',
        type: TwoFactorStatusResponseDto,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  twoFactorRegenerateBackupCodes: {
    summary: 'Regenerate backup codes',
    description:
      'Invalidates all existing backup codes and generates new ones. Requires 2FA to be enabled.',
    operationId: 'twoFactorRegenerateBackupCodes',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'New backup codes generated',
        schema: {
          type: 'object',
          properties: {
            backupCodes: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
      {
        status: 400,
        description: '2FA is not enabled',
        schema: { $ref: '#/components/schemas/ApiErrorDto' },
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
};
