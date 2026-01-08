import { TokenResponse } from './token-response.type';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
  tokens: TokenResponse;
}
