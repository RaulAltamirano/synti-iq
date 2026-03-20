import { TokensUserDto } from './token-user.dto';

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  tokens: TokensUserDto;
  sessionId: string;
}
