import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';
import { CreateStoreDto } from 'src/store/dto/create-store.dto';
import { AssignCashierDto } from 'src/store/dto/assign-cashier.dto';
import { Store } from 'src/store/entities/store.entity';

const apiErrorSchema = { $ref: '#/components/schemas/ApiErrorDto' };

export const storeEndpoints: Record<string, EndpointDocSpec> = {
  findAll: {
    summary: 'List stores with pagination and filters',
    description:
      'Returns a paginated list of stores for the current user. Supports filtering by businessProfileId, name, isActive, and sales targets.',
    operationId: 'storeFindAll',
    cookieAuth: true,
    query: [
      { name: 'page', description: 'Page number (default: 1)', type: 'number' },
      { name: 'limit', description: 'Items per page (default: 10, max: 100)', type: 'number' },
      { name: 'businessProfileId', description: 'Filter by business profile', type: 'string' },
      { name: 'name', description: 'Filter by store name', type: 'string' },
      { name: 'isActive', description: 'Filter by active status', type: 'boolean' },
      { name: 'minDailySalesTarget', description: 'Minimum daily sales target', type: 'number' },
      { name: 'maxDailySalesTarget', description: 'Maximum daily sales target', type: 'number' },
      { name: 'sortBy', description: 'Sort field', type: 'string' },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns paginated list of stores',
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PaginatedResponse' },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Store' },
                },
              },
            },
          ],
        },
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  findOne: {
    summary: 'Get a store by ID',
    description: 'Retrieves a single store by UUID. Returns 404 if not found or not accessible.',
    operationId: 'storeFindOne',
    cookieAuth: true,
    params: [{ name: 'id', description: 'Store UUID', type: 'string' }],
    responses: [
      {
        status: 200,
        description: 'Returns the store',
        type: Store,
      },
      {
        status: 404,
        description: 'Store not found',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  create: {
    summary: 'Create a new store',
    description:
      'Creates a new store. Optionally include opening schedules (one per day). Only business owners can create. Schedules are only created via this endpoint.',
    operationId: 'storeCreate',
    cookieAuth: true,
    body: CreateStoreDto,
    responses: [
      {
        status: 201,
        description: 'Store created',
        type: Store,
      },
      {
        status: 400,
        description: 'Invalid body (e.g. duplicate dayOfWeek, openTime >= closeTime)',
        schema: apiErrorSchema,
      },
      {
        status: 409,
        description: 'A store with this name already exists for this business',
        schema: apiErrorSchema,
      },
      {
        status: 403,
        description: 'Only business owners can create stores',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  remove: {
    summary: 'Delete a store',
    description: 'Permanently deletes a store. Returns 204 on success.',
    operationId: 'storeRemove',
    cookieAuth: true,
    params: [{ name: 'id', description: 'Store UUID', type: 'string' }],
    responses: [
      {
        status: 204,
        description: 'Store deleted successfully',
      },
      {
        status: 404,
        description: 'Store not found',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  assignCashier: {
    summary: 'Assign a cashier to a store',
    description: 'Assigns a cashier to the store. Returns true on success.',
    operationId: 'storeAssignCashier',
    cookieAuth: true,
    body: AssignCashierDto,
    params: [{ name: 'id', description: 'Store UUID', type: 'string' }],
    responses: [
      {
        status: 201,
        description: 'Cashier assigned successfully',
        schema: { type: 'boolean' },
      },
      {
        status: 404,
        description: 'Store or cashier not found',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  getCashiers: {
    summary: 'Get cashiers assigned to a store',
    description: 'Returns the list of cashiers assigned to the store.',
    operationId: 'storeGetCashiers',
    cookieAuth: true,
    params: [{ name: 'id', description: 'Store UUID', type: 'string' }],
    responses: [
      {
        status: 200,
        description: 'Returns list of cashiers',
      },
      {
        status: 404,
        description: 'Store not found',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
};
