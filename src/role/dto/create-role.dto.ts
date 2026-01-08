import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  MaxLength,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { SystemRole } from 'src/shared/enums/roles.enum';

export class CreateRoleDto {
  @IsEnum(SystemRole)
  @IsNotEmpty()
  name: SystemRole;

  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'Description must not exceed 500 characters',
  })
  description?: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(100, { message: 'Cannot assign more than 100 permission groups at once' })
  @IsNumber({}, { each: true })
  permissionGroupIds?: number[];
}
