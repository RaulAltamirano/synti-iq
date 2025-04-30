import { TokensUserDto } from './token-user.dto';

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
  };
  tokens: TokensUserDto;
}
