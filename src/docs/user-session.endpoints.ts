import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { CreateUserSessionDto } from 'src/user-session/dto/create-user-session.dto';
import { UserSessionResponseDto } from 'src/user-session/dto/user-session-response.dto';

export const userSessionEndpoints: Record<string, EndpointDocSpec> = {
  createSession: {
    summary: 'Create a new user session',
    body: CreateUserSessionDto,
    responses: [
      {
        status: 201,
        description: 'The session has been successfully created',
        type: UserSessionResponseDto,
      },
      {
        status: 400,
        description: 'Invalid input data',
      },
    ],
  },
  getActiveSessions: {
    summary: 'Get active sessions for the current user',
    responses: [
      {
        status: 200,
        description: 'Returns paginated list of active sessions',
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
    ],
  },
  getActiveDevices: {
    summary: 'Get active devices summary',
    responses: [
      {
        status: 200,
        description: 'Returns summary of active devices with session counts',
      },
    ],
  },
  invalidateSession: {
    summary: 'Invalidate a specific session',
    params: [
      {
        name: 'sessionId',
        description: 'ID of the session to invalidate',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 204,
        description: 'Session has been successfully invalidated',
      },
      {
        status: 404,
        description: 'Session not found',
      },
    ],
  },
  invalidateDeviceSessions: {
    summary: 'Invalidate all sessions for a specific device type',
    params: [
      {
        name: 'deviceType',
        description: 'Type of device (mobile, tablet, desktop)',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 204,
        description: 'All sessions for the device type have been invalidated',
      },
    ],
  },
  invalidateOtherSessions: {
    summary: 'Invalidate all sessions except the current one',
    params: [
      {
        name: 'sessionId',
        description: 'ID of the current session to keep active',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 204,
        description: 'All other sessions have been invalidated',
      },
    ],
  },
  invalidateAllSessions: {
    summary: 'Invalidate all sessions for the current user',
    responses: [
      {
        status: 204,
        description: 'All sessions have been invalidated',
      },
    ],
  },
  validateSession: {
    summary: 'Validate session ownership',
    params: [
      {
        name: 'sessionId',
        description: 'ID of the session to validate',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns whether the session is valid',
        schema: { type: 'boolean' },
      },
    ],
  },
  updateSessionLastUsed: {
    summary: 'Update session last used timestamp',
    params: [
      {
        name: 'sessionId',
        description: 'ID of the session to update',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 204,
        description: 'Session last used timestamp has been updated',
      },
    ],
  },
};
