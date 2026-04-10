import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { CreateTemplateItemDto } from 'src/_template/dto/create-template-item.dto';
import { UpdateTemplateItemDto } from 'src/_template/dto/update-template-item.dto';
import { TemplateItemResponseDto } from 'src/_template/dto/template-item-response.dto';

export const templateEndpoints: Record<string, EndpointDocSpec> = {
  list: {
    summary: 'List template items with pagination and filters',
    cookieAuth: true,
    query: [
      { name: 'page', description: 'Page number (default: 1)', type: 'number' },
      { name: 'limit', description: 'Items per page (default: 10, max: 100)', type: 'number' },
      { name: 'sortBy', description: 'Sort field (id, name, createdAt, status)', type: 'string' },
      { name: 'sortOrder', description: 'Sort order (ASC, DESC)', type: 'string' },
      { name: 'name', description: 'Filter by name (partial match)', type: 'string' },
      { name: 'status', description: 'Filter by status (active, inactive)', type: 'string' },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns paginated list of template items',
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PaginatedResponseDto' },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TemplateItemResponseDto' },
                },
              },
            },
          ],
        },
      },
    ],
  },
  findById: {
    summary: 'Get a template item by ID',
    cookieAuth: true,
    params: [
      {
        name: 'id',
        description: 'Template item UUID',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns the template item',
        type: TemplateItemResponseDto,
      },
      {
        status: 404,
        description: 'Template item not found',
      },
    ],
  },
  create: {
    summary: 'Create a new template item',
    cookieAuth: true,
    body: CreateTemplateItemDto,
    responses: [
      {
        status: 201,
        description: 'Template item created successfully',
        type: TemplateItemResponseDto,
      },
      {
        status: 400,
        description: 'Invalid input',
      },
    ],
  },
  update: {
    summary: 'Update a template item',
    cookieAuth: true,
    body: UpdateTemplateItemDto,
    params: [
      {
        name: 'id',
        description: 'Template item UUID',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Template item updated successfully',
        type: TemplateItemResponseDto,
      },
      {
        status: 404,
        description: 'Template item not found',
      },
      {
        status: 400,
        description: 'Invalid input',
      },
    ],
  },
  delete: {
    summary: 'Delete a template item',
    cookieAuth: true,
    params: [
      {
        name: 'id',
        description: 'Template item UUID',
        type: 'string',
      },
    ],
    responses: [
      {
        status: 204,
        description: 'Template item deleted successfully',
      },
      {
        status: 404,
        description: 'Template item not found',
      },
    ],
  },
};
