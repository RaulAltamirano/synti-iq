import type { TokensUserDto } from './token-user.dto';

export class RefreshTokensResponseDto {
  tokens: TokensUserDto;
  sessionId: string;
}
