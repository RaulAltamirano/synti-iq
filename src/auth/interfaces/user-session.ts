import { TokenResponse } from './token-response.type';

export interface UserSession {
  id: string;
  email: string;
  roles: string[];
  permissions?: string[];
  tokens: TokenResponse;
}
