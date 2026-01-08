import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

/**
 * DTO for creating permission groups.
 * NOTE: This DTO is only used by UpdatePermissionGroupDto (via PartialType).
 * Permission groups should be created via seeds, not through API endpoints.
 * @see UpdatePermissionGroupDto
 */
export class CreatePermissionGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'Description must not exceed 500 characters',
  })
  description?: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(200, { message: 'Cannot assign more than 200 permissions at once' })
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}
