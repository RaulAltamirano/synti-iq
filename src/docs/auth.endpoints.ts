import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { RegisterBusinessDto } from 'src/auth/dto/register-business.dto';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { TotpSetupResponseDto } from 'src/auth/dto/totp-setup-response.dto';
import { VerifyTotpDto } from 'src/auth/dto/verify-totp.dto';
import { TwoFactorStatusResponseDto } from 'src/auth/dto/two-factor-status-response.dto';

const apiErrorSchema = { $ref: '#/components/schemas/ApiErrorDto' };

export const authEndpoints: Record<string, EndpointDocSpec> = {
  signup: {
    summary: 'Register a new user',
    description:
      'Creates a new user account with email and password. Returns JWT tokens and session ID. Fails with 409 if email already exists.',
    operationId: 'authSignup',
    body: SignUpDto,
    responses: [
      {
        status: 201,
        description: 'User registered successfully',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'User registered successfully' },
            user: { type: 'object' },
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'number' },
            refresh_expires_in: { type: 'number' },
            sessionId: { type: 'string' },
          },
        },
      },
      {
        status: 400,
        description: 'Invalid input data',
        schema: apiErrorSchema,
      },
      {
        status: 409,
        description: 'User with this email already exists',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ hasBody: true }),
    ],
  },
  registerBusiness: {
    summary: 'Register a new business account',
    description:
      'Creates a new business owner account. Optionally accepts a referral code for benefits. Sends welcome email on success.',
    operationId: 'authRegisterBusiness',
    body: RegisterBusinessDto,
    responses: [
      {
        status: 201,
        description: 'Business account registered successfully',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Business account registered successfully' },
            user: { type: 'object' },
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'number' },
            refresh_expires_in: { type: 'number' },
            sessionId: { type: 'string' },
          },
        },
      },
      {
        status: 400,
        description: 'Invalid input data',
        schema: apiErrorSchema,
      },
      {
        status: 409,
        description: 'User with this email already exists',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ hasBody: true }),
    ],
  },
  login: {
    summary: 'Authenticate user and get tokens',
    description:
      'Authenticates with email and password. Returns JWT tokens and sets cookies for session management. Password must contain uppercase, lowercase, and number. When 2FA is enabled, returns 401 with requires_2fa: true; client must resend with totpCode (6-digit TOTP or backup code XXXX-XXXX-XXXX).',
    operationId: 'authLogin',
    body: LoginUserDto,
    responses: [
      {
        status: 200,
        description: 'Successfully authenticated',
        schema: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'number' },
            refresh_expires_in: { type: 'number' },
            sessionId: { type: 'string' },
          },
        },
      },
      {
        status: 400,
        description: 'Invalid credentials',
        schema: apiErrorSchema,
      },
      {
        status: 401,
        description:
          'Unauthorized, or TOTP required when 2FA enabled (response includes requires_2fa: true)',
        schema: {
          type: 'object',
          properties: {
            requires_2fa: { type: 'boolean', example: true },
            message: { type: 'string', example: 'TOTP code required' },
          },
        },
      },
      ...getStandardErrorResponses({ hasBody: true }),
    ],
  },
  logout: {
    summary: 'Logout current user and invalidate session',
    description:
      'Invalidates the current session and clears auth cookies. Requires valid access token.',
    operationId: 'authLogout',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'Successfully logged out',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Successfully logged out' },
          },
        },
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  auth2faSetup: {
    summary: 'Start 2FA setup',
    description:
      'Creates a new TOTP secret and QR code for the authenticator app. User must scan the QR code and complete verification with POST /auth/2fa/verify within 5 minutes.',
    operationId: 'auth2faSetup',
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
  auth2faVerify: {
    summary: 'Verify and activate 2FA',
    description:
      'Verifies the TOTP code from the authenticator app and activates 2FA for the user. Returns backup codes that must be stored securely. Each backup code can only be used once.',
    operationId: 'auth2faVerify',
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
        schema: apiErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid TOTP code',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  auth2faDisable: {
    summary: 'Disable 2FA',
    description: 'Disables 2FA for the user. Requires current TOTP code or a valid backup code.',
    operationId: 'auth2faDisable',
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
        schema: apiErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid TOTP or backup code',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  auth2faStatus: {
    summary: 'Get 2FA status',
    description: 'Returns whether 2FA is enabled and the number of backup codes remaining.',
    operationId: 'auth2faStatus',
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
  auth2faRegenerateBackupCodes: {
    summary: 'Regenerate backup codes',
    description:
      'Invalidates all existing backup codes and generates new ones. Requires 2FA to be enabled.',
    operationId: 'auth2faRegenerateBackupCodes',
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
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  refresh: {
    summary: 'Refresh access token using refresh_token cookie',
    description:
      'Exchanges the refresh_token cookie for new access and refresh tokens. Requires refresh_token cookie to be present and valid.',
    operationId: 'authRefresh',
    responses: [
      {
        status: 200,
        description: 'Tokens refreshed successfully',
        schema: {
          type: 'object',
          properties: {
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'number' },
            refresh_expires_in: { type: 'number' },
            sessionId: { type: 'string' },
          },
        },
      },
      {
        status: 401,
        description: 'Refresh token cookie is required or invalid/expired',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({}),
    ],
  },
};
