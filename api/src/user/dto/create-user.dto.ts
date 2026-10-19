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
  IsBoolean,
} from 'class-validator';
import { SystemRole } from 'src/shared/enums/roles.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  /** When true (CASHIER only), user is created without a password until invitation flow completes. */
  @IsOptional()
  @IsBoolean()
  pendingPasswordSetup?: boolean;

  @ValidateIf(o => !o.pendingPasswordSetup)
  @IsString()
  @MinLength(8)
  password?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(SystemRole)
  role: SystemRole;

  @ValidateIf(o => [SystemRole.CASHIER, SystemRole.DELIVERY, SystemRole.PROVIDER].includes(o.role))
  @IsNotEmpty({ message: 'profileData is required for CASHIER, DELIVERY, or PROVIDER roles' })
  @IsObject()
  profileData?: Record<string, unknown>;

  /** Must match {@link Store.businessProfileId} for the store in profileData when role is CASHIER. */
  @ValidateIf(o => o.role === SystemRole.CASHIER)
  @IsNotEmpty({ message: 'actingBusinessProfileId is required when role is CASHIER' })
  @IsUUID()
  actingBusinessProfileId?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
