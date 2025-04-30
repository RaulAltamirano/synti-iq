import { IsUUID, IsOptional } from 'class-validator';

export class TokenPayloadDto {
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  sub: string;

  @IsOptional()
  @IsUUID(4, { message: 'Session ID must be a valid UUID' })
  sid?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Token ID must be a valid UUID' })
  jti?: string;
}
