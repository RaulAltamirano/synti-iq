import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * OpenAPI schema for paginated responses. Keep aligned with PaginatedResponse<T> interface.
 * Used only for Swagger documentation via extraModels; not for runtime validation.
 */
export class PaginatedResponseDto {
  @ApiProperty({ type: 'array', description: 'List of items' })
  items: unknown[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiPropertyOptional({ description: 'Whether there is a next page' })
  hasNextPage?: boolean;

  @ApiPropertyOptional({ description: 'Whether there is a previous page' })
  hasPreviousPage?: boolean;
}
