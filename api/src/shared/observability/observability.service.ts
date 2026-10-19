import { Injectable, OnModuleInit } from '@nestjs/common';
import { trace, context, SpanStatusCode, Span } from '@opentelemetry/api';
import { Counter, Histogram, Registry } from 'prom-client';

export interface SpanContextOptions {
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Collapse high-cardinality path segments for Prometheus `route` labels.
 * UUID and 32-char hex segments first (so numeric regex does not split UUIDs), then pure-numeric
 * path segments, then long opaque tokens. Long slugs may collapse — trade-off vs Prometheus cardinality.
 */
export function sanitizeMetricRoute(route: string): string {
  const pathOnly = route.split('?')[0];
  return pathOnly
    .replaceAll(/\/[a-f0-9-]{36}(?=\/|$)/gi, '/:id')
    .replaceAll(/\/[a-f0-9]{32}(?=\/|$)/gi, '/:id')
    .replaceAll(/\/\d+(?=\/|$)/g, '/:id')
    .replaceAll(/\/[a-zA-Z0-9_-]{12,}(?=\/|$)/g, '/:id');
}

@Injectable()
export class ObservabilityService implements OnModuleInit {
  private readonly tracer = trace.getTracer('synti-iq-api');
  private readonly registry = new Registry();
  private httpRequestDuration!: Histogram;
  private httpRequestTotal!: Counter;

  getTraceId(): string | undefined {
    const span = trace.getActiveSpan();
    if (!span) {
      return undefined;
    }
    const spanContext = span.spanContext();
    return spanContext.traceId && spanContext.traceId !== '00000000000000000000000000000000'
      ? spanContext.traceId
      : undefined;
  }

  getSpanId(): string | undefined {
    const span = trace.getActiveSpan();
    if (!span) {
      return undefined;
    }
    const spanContext = span.spanContext();
    return spanContext.spanId && spanContext.spanId !== '0000000000000000'
      ? spanContext.spanId
      : undefined;
  }

  getTraceContext(): { traceId?: string; spanId?: string } {
    return {
      traceId: this.getTraceId(),
      spanId: this.getSpanId(),
    };
  }

  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    options?: SpanContextOptions,
  ): Promise<T> {
    const span = this.tracer.startSpan(name, { attributes: options?.attributes });
    try {
      const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }

  createCounter(name: string, help: string, labelNames: string[] = []): Counter {
    const counter = new Counter({
      name,
      help,
      labelNames,
      registers: [this.registry],
    });
    return counter;
  }

  createHistogram(name: string, help: string, labelNames: string[] = []): Histogram {
    const histogram = new Histogram({
      name,
      help,
      labelNames,
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
      registers: [this.registry],
    });
    return histogram;
  }

  getRegistry(): Registry {
    return this.registry;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  onModuleInit() {
    this.httpRequestDuration = this.createHistogram(
      'http_request_duration_seconds',
      'Duration of HTTP requests in seconds',
      ['method', 'route', 'status_code'],
    );

    this.httpRequestTotal = this.createCounter(
      'http_requests_total',
      'Total number of HTTP requests',
      ['method', 'route', 'status_code'],
    );
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    const labels = {
      method,
      route: sanitizeMetricRoute(route),
      status_code: statusCode.toString(),
    };

    this.httpRequestDuration.observe(labels, duration / 1000);
    this.httpRequestTotal.inc(labels);
  }
}
