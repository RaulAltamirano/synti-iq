import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * OpenAPI schema for API error responses.
 * Mirrors ErrorResponse from src/shared/response/interfaces/standard-response.interface.ts.
 * Used only for Swagger documentation via extraModels; not for runtime validation.
 * Note: Uses explicit schema for `data` to avoid NestJS Swagger circular dependency.
 */
export class ApiErrorDto {
  @ApiProperty({ example: 'error', description: 'Response status' })
  status: 'error';

  @ApiProperty({ example: 'Bad Request', description: 'Human-readable error message' })
  message: string;

  @ApiProperty({ example: 'BAD_REQUEST', description: 'Machine-readable error code' })
  code: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Always null on error responses',
  })
  data?: null;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string' },
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
    description: 'Validation or field-specific error details',
  })
  errors?: Array<{ field?: string; code?: string; message: string }>;

  @ApiProperty({
    example: {
      requestId: 'req-123',
      traceId: 'trace-456',
      spanId: 'span-789',
      timestamp: '2025-03-23T12:00:00.000Z',
      path: '/api/auth/login',
      statusCode: 400,
    },
    description: 'Request metadata',
  })
  meta: Record<string, unknown>;
}
