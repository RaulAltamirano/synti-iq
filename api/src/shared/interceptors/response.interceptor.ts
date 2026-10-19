import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import {
  StandardResponse,
  isStandardResponse,
} from '../response/interfaces/standard-response.interface';
import { ObservabilityService } from '../observability/observability.service';
import { getRequestId } from './request-id.middleware';
import { SKIP_RESPONSE_INTERCEPTOR_KEY } from './skip-response-interceptor.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly observabilityService: ObservabilityService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_INTERCEPTOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipInterceptor) {
      return next.handle();
    }

    const startTime = Date.now();
    const method = request.method;
    const route = request.route?.path || request.path || request.url.split('?')[0];

    return next.handle().pipe(
      map(data => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || 200;

        if (isStandardResponse(data)) {
          this.observabilityService.recordHttpRequest(method, route, statusCode, duration);
          return data;
        }

        const requestId = getRequestId();
        const { traceId, spanId } = this.observabilityService.getTraceContext();

        const standardizedResponse: StandardResponse<any> = {
          status: 'success',
          data: data,
          meta: {
            requestId: requestId || 'unknown',
            traceId,
            spanId,
            timestamp: new Date().toISOString(),
            path: request.url || request.path || '/',
            statusCode,
          },
        };

        if (traceId) {
          response.setHeader('Trace-Id', traceId);
        }
        if (spanId) {
          response.setHeader('Span-Id', spanId);
        }

        this.observabilityService.recordHttpRequest(method, route, statusCode, duration);

        return standardizedResponse;
      }),
    );
  }
}
