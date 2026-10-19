import { IsString } from 'class-validator';
import { TokenDto } from 'src/shared/jwt-helper/interfaces/token-dto.interface';

export class TokensUserDto {
  @IsString()
  token: TokenDto;
  @IsString()
  refreshToken: TokenDto;
}
