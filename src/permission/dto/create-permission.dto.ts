import { IsString, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';

/**
 * DTO for creating permissions.
 * NOTE: This DTO is only used by UpdatePermissionDto (via PartialType).
 * Permissions should be created via seeds, not through API endpoints.
 * @see UpdatePermissionDto
 */
export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Permission name must contain only lowercase letters, numbers, and underscores',
  })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'Description must not exceed 500 characters',
  })
  description?: string;
}
