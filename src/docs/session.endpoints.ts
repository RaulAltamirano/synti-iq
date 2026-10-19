import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';

export const sessionEndpoints: Record<string, EndpointDocSpec> = {
  listSessions: {
    summary: 'List active sessions',
    description: 'Returns paginated active sessions for the authenticated user.',
    operationId: 'sessionsList',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'Paginated list of active sessions',
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PaginatedResponseDto' },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/UserSessionResponseDto' },
                },
              },
            },
          ],
        },
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  deleteSession: {
    summary: 'Invalidate a specific session',
    description: 'Revokes the given session for the current user.',
    operationId: 'sessionsDeleteOne',
    cookieAuth: true,
    params: [
      {
        name: 'id',
        description: 'Session ID to invalidate',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 204,
        description: 'Session invalidated',
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  deleteAllSessions: {
    summary: 'Invalidate all sessions',
    description: 'Revokes every active session for the current user.',
    operationId: 'sessionsDeleteAll',
    cookieAuth: true,
    responses: [
      {
        status: 204,
        description: 'All sessions invalidated',
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
};
