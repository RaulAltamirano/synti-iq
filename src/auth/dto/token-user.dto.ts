import { IsString } from 'class-validator';

export class TokensUserDto {
  @IsString()
  token: string;
  @IsString()
  refreshToken: string;
}
