import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { SystemRole } from 'src/shared/enums/roles.enum';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEnum(SystemRole, {
    message: 'Role must be a valid system role',
  })
  role?: SystemRole; // Optional - will always be forced to CUSTOMER by AuthService
}
