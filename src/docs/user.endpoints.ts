import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';

const apiErrorSchema = { $ref: '#/components/schemas/ApiErrorDto' };

export const userEndpoints: Record<string, EndpointDocSpec> = {
  filterUsers: {
    summary: 'List users with pagination and filters',
    description:
      'Returns a paginated list of users. Supports filtering by name, email, isActive, isOnline, isPendingApproval, and roles. Requires appropriate permissions.',
    operationId: 'userFilterUsers',
    cookieAuth: true,
    query: [
      { name: 'page', description: 'Page number (default: 1)', type: 'number' },
      { name: 'limit', description: 'Items per page (default: 10, max: 100)', type: 'number' },
      { name: 'name', description: 'Filter by name', type: 'string' },
      { name: 'email', description: 'Filter by email', type: 'string' },
      { name: 'isActive', description: 'Filter by active status', type: 'boolean' },
      { name: 'isOnline', description: 'Filter by online status', type: 'boolean' },
      { name: 'isPendingApproval', description: 'Filter by approval status', type: 'boolean' },
      { name: 'roles', description: 'Filter by roles (array)', type: 'array' },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns paginated list of users',
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PaginatedResponseDto' },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          ],
        },
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  getMyProfile: {
    summary: 'Get current authenticated user profile',
    description:
      'Returns the profile of the authenticated user including role, approval status, online status, and linked profile data.',
    operationId: 'userGetMyProfile',
    cookieAuth: true,
    responses: [
      {
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            isActive: { type: 'boolean' },
            isApproved: { type: 'boolean' },
            approvedAt: { type: 'string', format: 'date-time' },
            approvedBy: { type: 'string' },
            isOnline: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            lastLogin: { type: 'string', format: 'date-time' },
            lastActivityAt: { type: 'string', format: 'date-time' },
            profile: { type: 'object', nullable: true },
          },
        },
      },
      {
        status: 404,
        description: 'User not found or inactive',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
};
