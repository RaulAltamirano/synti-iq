import { TokensUserDto } from '../dto/token-user.dto';

export class TokenResponseHelper {
  static build(tokens: TokensUserDto) {
    return {
      token_type: 'Bearer',
      expires_in: this.getExpiresInSeconds(tokens.token.expiresIn),
      refresh_expires_in: this.getExpiresInSeconds(tokens.refreshToken.expiresIn),
    };
  }

  private static getExpiresInSeconds(expiresIn: string): number {
    if (!expiresIn) return 0;

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 0;
    }
  }
}
