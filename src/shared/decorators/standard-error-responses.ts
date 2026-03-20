import { ResponseSpec } from './interfaces/endpoint-doc-spec.interface';

const API_ERROR_SCHEMA = { $ref: '#/components/schemas/ApiErrorDto' };

/**
 * Returns standard error response specs for OpenAPI documentation.
 * Use when building endpoint specs to ensure consistent error documentation.
 */
export function getStandardErrorResponses(options: {
  cookieAuth?: boolean;
  hasBody?: boolean;
  hasIdParam?: boolean;
}): ResponseSpec[] {
  const out: ResponseSpec[] = [];
  if (options.hasBody) {
    out.push({
      status: 400,
      description: 'Bad Request - Invalid input',
      schema: API_ERROR_SCHEMA,
    });
  }
  if (options.cookieAuth) {
    out.push({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
      schema: API_ERROR_SCHEMA,
    });
    out.push({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      schema: API_ERROR_SCHEMA,
    });
  }
  if (options.hasIdParam) {
    out.push({
      status: 404,
      description: 'Not Found - Resource does not exist',
      schema: API_ERROR_SCHEMA,
    });
  }
  out.push({
    status: 500,
    description: 'Internal Server Error',
    schema: API_ERROR_SCHEMA,
  });
  return out;
}
