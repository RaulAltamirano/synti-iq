import { IsUUID, IsNotEmpty, IsString, IsOptional, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceInfoDto } from './device-info.dto';

export class CreateUserSessionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ValidateNested()
  @Type(() => DeviceInfoDto)
  @IsOptional()
  deviceInfo?: DeviceInfoDto;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastUsed?: Date;
}
