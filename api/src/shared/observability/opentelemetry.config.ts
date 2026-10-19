import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const RESOURCE_DEPLOYMENT_ENVIRONMENT = 'deployment.environment' as const;

export function initializeOpenTelemetry(): NodeSDK | null {
  if (process.env.OTEL_SDK_DISABLED === '1' || process.env.NODE_ENV === 'test') {
    return null;
  }

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'synti-iq-api',
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [RESOURCE_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    traceExporter: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? new OTLPTraceExporter({
          url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
        })
      : undefined,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreIncomingRequestHook: req => {
            return req.url?.includes('/health') || false;
          },
        },
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
      }),
    ],
  });

  sdk.start();

  const shutdown = (): void => {
    void sdk.shutdown().finally(() => process.exit(0));
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  return sdk;
}
