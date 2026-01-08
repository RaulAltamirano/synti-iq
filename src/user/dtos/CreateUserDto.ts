import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { SystemRole } from 'src/shared/enums/roles.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(SystemRole)
  role: SystemRole;

  @ValidateIf(o => [SystemRole.CASHIER, SystemRole.DELIVERY, SystemRole.PROVIDER].includes(o.role))
  @IsNotEmpty({ message: 'profileData is required for CASHIER, DELIVERY, or PROVIDER roles' })
  @IsObject()
  profileData?: any;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
