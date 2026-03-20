import { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';
import { getStandardErrorResponses } from 'src/shared/decorators/standard-error-responses';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { Product } from 'src/product/entities/product.entity';

const apiErrorSchema = { $ref: '#/components/schemas/ApiErrorDto' };

export const productEndpoints: Record<string, EndpointDocSpec> = {
  findAll: {
    summary: 'Get all products with filters',
    description:
      'Returns a paginated list of products. Supports filtering by name, SKU, barcode, brand, price range, and more. Requires VIEW_PRODUCTS permission.',
    operationId: 'productFindAll',
    cookieAuth: true,
    query: [
      { name: 'page', description: 'Page number (default: 1)', type: 'number' },
      { name: 'limit', description: 'Items per page (default: 10, max: 100)', type: 'number' },
      { name: 'name', description: 'Filter by name (partial match)', type: 'string' },
      { name: 'sku', description: 'Filter by SKU', type: 'string' },
      { name: 'barcode', description: 'Filter by barcode', type: 'string' },
      { name: 'brand', description: 'Filter by brand', type: 'string' },
      { name: 'isActive', description: 'Filter by active status', type: 'boolean' },
      { name: 'minPrice', description: 'Minimum selling price', type: 'number' },
      { name: 'maxPrice', description: 'Maximum selling price', type: 'number' },
      { name: 'orderBy', description: 'Sort field', type: 'string' },
      { name: 'orderDirection', description: 'Sort direction (ASC, DESC)', type: 'string' },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns paginated list of products',
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PaginatedResponse' },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          ],
        },
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  findById: {
    summary: 'Get a product by ID',
    description: 'Retrieves a single product by UUID. Returns 404 if not found.',
    operationId: 'productFindById',
    cookieAuth: true,
    params: [{ name: 'id', description: 'Product UUID', type: 'string' }],
    responses: [
      {
        status: 200,
        description: 'Returns the product',
        type: Product,
      },
      {
        status: 404,
        description: 'Product not found',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  create: {
    summary: 'Create a new product',
    description:
      'Creates a new product. Requires CREATE_PRODUCTS permission. Fails with 409 if SKU or barcode already exists.',
    operationId: 'productCreate',
    cookieAuth: true,
    body: CreateProductDto,
    responses: [
      {
        status: 201,
        description: 'Product created successfully',
        type: Product,
      },
      {
        status: 400,
        description: 'Invalid product data',
        schema: apiErrorSchema,
      },
      {
        status: 409,
        description: 'Product with same SKU or barcode already exists',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  update: {
    summary: 'Update a product',
    description: 'Partially updates a product. Requires UPDATE_PRODUCTS permission.',
    operationId: 'productUpdate',
    cookieAuth: true,
    body: UpdateProductDto,
    params: [{ name: 'id', description: 'Product UUID', type: 'string' }],
    responses: [
      {
        status: 200,
        description: 'Product updated successfully',
        type: Product,
      },
      {
        status: 404,
        description: 'Product not found',
        schema: apiErrorSchema,
      },
      {
        status: 400,
        description: 'Invalid update data',
        schema: apiErrorSchema,
      },
      {
        status: 409,
        description: 'Product with same SKU or barcode already exists',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true, hasBody: true }),
    ],
  },
  remove: {
    summary: 'Delete a product permanently',
    description: 'Permanently deletes a product. Requires DELETE_PRODUCTS permission.',
    operationId: 'productRemove',
    cookieAuth: true,
    params: [{ name: 'id', description: 'Product UUID', type: 'string' }],
    responses: [
      {
        status: 200,
        description: 'Product deleted successfully',
      },
      {
        status: 404,
        description: 'Product not found',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  softRemove: {
    summary: 'Soft delete a product (deactivate)',
    description: 'Deactivates a product without removing it. Requires DELETE_PRODUCTS permission.',
    operationId: 'productSoftRemove',
    cookieAuth: true,
    params: [{ name: 'id', description: 'Product UUID', type: 'string' }],
    responses: [
      {
        status: 200,
        description: 'Product deactivated successfully',
        type: Product,
      },
      {
        status: 404,
        description: 'Product not found',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
  findBySkuOrBarcode: {
    summary: 'Search products by SKU or barcode',
    description:
      'Returns products matching the given SKU and optionally barcode. Requires VIEW_PRODUCTS permission.',
    operationId: 'productFindBySkuOrBarcode',
    cookieAuth: true,
    query: [
      { name: 'sku', description: 'Product SKU', type: 'string' },
      { name: 'barcode', description: 'Product barcode (optional)', type: 'string' },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns matching products',
        schema: {
          type: 'array',
          items: { $ref: '#/components/schemas/Product' },
        },
      },
      {
        status: 400,
        description: 'Invalid search parameters',
        schema: apiErrorSchema,
      },
      ...getStandardErrorResponses({ cookieAuth: true }),
    ],
  },
};
