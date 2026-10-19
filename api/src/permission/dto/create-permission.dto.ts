import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { IsPermissionName } from 'src/shared/validators/is-permission-name.validator';

/**
 * DTO for creating permissions.
 * NOTE: This DTO is only used by UpdatePermissionDto (via PartialType).
 * Permissions should be created via seeds, not through API endpoints.
 * @see UpdatePermissionDto
 */
export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @IsPermissionName()
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'Description must not exceed 500 characters',
  })
  description?: string;
}
