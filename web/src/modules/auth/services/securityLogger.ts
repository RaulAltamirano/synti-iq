export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'session_expired'
  | 'session_timeout'
  | 'access_denied'
  | 'refresh_failed'
  | 'registration_success'
  | 'registration_failed'
  | 'invalid_referral_code';

export interface SecurityEventMetadata {
  statusCode?: number;
  endpoint?: string;
  errorCode?: string;
  reason?: string;
  timestamp?: string;
}

export const securityLogger = {
  logAuthEvent(
    _event: SecurityEventType,
    _metadata?: SecurityEventMetadata & Record<string, unknown>
  ): void {},

  loginSuccess(): void {
    this.logAuthEvent('login_success');
  },

  loginFailed(reason?: string, statusCode?: number): void {
    this.logAuthEvent('login_failed', { reason, statusCode });
  },

  logout(): void {
    this.logAuthEvent('logout');
  },

  sessionExpired(): void {
    this.logAuthEvent('session_expired');
  },

  sessionTimeout(): void {
    this.logAuthEvent('session_timeout');
  },

  accessDenied(endpoint?: string): void {
    this.logAuthEvent('access_denied', { endpoint });
  },

  refreshFailed(reason?: string): void {
    this.logAuthEvent('refresh_failed', { reason });
  },

  registrationSuccess(): void {
    this.logAuthEvent('registration_success');
  },

  registrationFailed(reason?: string, statusCode?: number): void {
    this.logAuthEvent('registration_failed', { reason, statusCode });
  },

  invalidReferralCode(): void {
    this.logAuthEvent('invalid_referral_code');
  },
};
