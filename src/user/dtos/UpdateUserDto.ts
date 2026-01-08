import { IsEmail, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { SystemRole } from 'src/shared/enums/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(SystemRole)
  role?: SystemRole;

  @IsOptional()
  @IsObject()
  profileData?: any;
}
