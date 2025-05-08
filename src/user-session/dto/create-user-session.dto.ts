import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateUserSessionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
