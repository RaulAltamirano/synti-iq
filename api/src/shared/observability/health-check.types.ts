export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  checks: {
    database: 'ok' | 'down';
    redis: 'ok' | 'down';
  };
}
