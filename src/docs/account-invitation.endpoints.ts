import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';
import { AcceptInvitationDto } from 'src/auth/account-invitation/dto/accept-invitation.dto';

const apiErrorSchema = { $ref: '#/components/schemas/ApiErrorDto' };

export const accountInvitationEndpoints: Record<string, EndpointDocSpec> = {
  acceptInvitation: {
    summary: 'Accept account invitation and set password',
    description:
      'Public endpoint. Sets the account password using the opaque token from the invitation email (single use, expires after configured hours). Replaces the legacy POST /auth/password-setup route.',
    operationId: 'invitationsAccept',
    body: AcceptInvitationDto,
    responses: [
      {
        status: 200,
        description: 'Password set successfully',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Password set successfully' },
          },
        },
      },
      {
        status: 404,
        description: 'Invalid or already used token',
        schema: apiErrorSchema,
      },
      {
        status: 422,
        description: 'Token expired or password already set',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ hasBody: true }),
    ],
  },
};
