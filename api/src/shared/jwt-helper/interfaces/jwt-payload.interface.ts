export interface JwtPayload {
  sub: string;
  email?: string;
  sid?: string;
  jti: string;
  [key: string]: any;
}
