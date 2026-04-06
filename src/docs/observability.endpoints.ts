import type { EndpointDocSpec } from 'src/shared/decorators/interfaces/endpoint-doc-spec.interface';

const healthCheckSchema: Record<string, unknown> = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['ok', 'error'], description: 'Overall health status' },
    timestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp' },
    checks: {
      type: 'object',
      properties: {
        database: { type: 'string', enum: ['ok', 'down'] },
        redis: { type: 'string', enum: ['ok', 'down'] },
      },
      required: ['database', 'redis'],
    },
  },
  required: ['status', 'timestamp', 'checks'],
};

export const observabilityEndpoints: Record<string, EndpointDocSpec> = {
  getHealth: {
    summary: 'Health check (liveness / readiness)',
    description:
      'Runs `SELECT 1` on the app database and `PING` on Redis. Returns 200 when both pass; 503 when any check fails.',
    responses: [
      {
        status: 200,
        description: 'All dependency checks passed',
        schema: healthCheckSchema,
      },
      {
        status: 503,
        description: 'One or more dependency checks failed',
        schema: healthCheckSchema,
      },
    ],
  },
  getMetrics: {
    summary: 'Prometheus metrics',
    description:
      'Exposes Prometheus text format. When `METRICS_API_KEY` is set, send `X-Metrics-Key` or `Authorization: Bearer <key>`. In development without a key, only loopback may scrape.',
    responses: [
      {
        status: 200,
        description: 'Prometheus exposition format (text/plain)',
      },
      {
        status: 403,
        description: 'Invalid or missing metrics credentials',
      },
    ],
  },
};
