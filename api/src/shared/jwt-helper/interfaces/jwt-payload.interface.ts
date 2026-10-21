export interface JwtPayload {
  sub: string;
  email?: string;
  sid?: string;
  jti: string;
  tokenUse?: 'access' | 'refresh';
  [key: string]: any;
}
