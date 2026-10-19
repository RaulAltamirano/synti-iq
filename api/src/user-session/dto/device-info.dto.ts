import { IsString, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class DeviceInfoDto {
  @Expose()
  @IsString()
  @IsOptional()
  deviceType?: string;

  @Expose()
  @IsString()
  @IsOptional()
  deviceName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  browser?: string;

  @Expose()
  @IsString()
  @IsOptional()
  browserVersion?: string;

  @Expose()
  @IsString()
  @IsOptional()
  os?: string;

  @Expose()
  @IsString()
  @IsOptional()
  osVersion?: string;

  @Expose()
  @IsString()
  @IsOptional()
  userAgent?: string;

  @Expose()
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @Expose()
  @IsString()
  @IsOptional()
  location?: string;
}
