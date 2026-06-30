import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: string[];
    permissions?: string[];
  }
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  meta: {
    requestId: string;
    traceId: string;
    spanId: string;
    timestamp: string;
    path: string;
    statusCode: number;
  };
}

export interface AuthData {
  user: User;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  sessionId: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions?: string[];
}

export interface AuthError extends Error {
  code: string;
  status?: number;
}

export class RequiresTotpError extends Error {
  readonly requiresTotp = true;

  constructor(message = 'TOTP code required') {
    super(message);
    this.name = 'RequiresTotpError';
    Object.setPrototypeOf(this, RequiresTotpError.prototype);
  }
}
