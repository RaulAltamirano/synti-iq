export const ENDPOINTS = {
  TEST: '/test-endpoint',
  TEST_AUTH: '/test-endpoint-auth',
  USERS: '/users',
  LOGIN: '/auth/login',
  /** Cashier invitation: set password (opaque token from email) */
  PASSWORD_SETUP: '/invitations/accept',
  REFRESH_TOKEN: '/auth/refresh',
};

export const AUTH_2FA_ENDPOINTS = {
  SETUP: '/2fa/setup',
  VERIFY: '/2fa/verify',
  DISABLE: '/2fa/disable',
  STATUS: '/2fa/status',
  REGENERATE_BACKUP_CODES: '/2fa/backup-codes/regenerate',
} as const;
