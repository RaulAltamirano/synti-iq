import { IsString, IsOptional } from 'class-validator';

export class SessionMetadataDto {
  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  deviceInfo?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
