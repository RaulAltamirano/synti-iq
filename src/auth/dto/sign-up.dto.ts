import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
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

  @IsNotEmpty()
  @IsEnum(SystemRole, {
    message: 'Role must be a valid system role',
  })
  role: SystemRole;
}
