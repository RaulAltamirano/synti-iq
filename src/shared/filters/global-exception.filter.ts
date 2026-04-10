import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ErrorResponse } from '../response/interfaces/standard-response.interface';
import { ObservabilityService } from '../observability/observability.service';
import { getRequestId } from '../interceptors/request-id.middleware';

/** Same element type as `ErrorResponse.errors` — single source of truth with the interface. */
type ErrorFieldList = NonNullable<ErrorResponse['errors']>;

/** Normalized shape after classifying `unknown` — drives JSON body + HTTP status. */
interface ErrorPayload {
  status: number;
  message: string;
  code: string;
  errors?: ErrorFieldList;
}

interface HttpExceptionResponse {
  message?: string | string[];
  code?: string;
  context?: {
    field?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly observabilityService: ObservabilityService) {}

  private messageAndErrorsFromHttpBody(
    responseObj: HttpExceptionResponse,
    exception: HttpException,
  ): { message: string; errors?: ErrorFieldList } {
    const responseMessage = responseObj.message;
    if (Array.isArray(responseMessage)) {
      return {
        message: 'Validation failed',
        errors: responseMessage.map((msg: string) => ({ message: msg })),
      };
    }
    if (typeof responseMessage === 'string' && responseMessage) {
      return { message: responseMessage };
    }
    return { message: exception.message || 'An error occurred' };
  }

  private parseHttpExceptionResponse(
    exception: HttpException,
    status: number,
    defaultCode: string,
  ): { message: string; code: string; errors?: ErrorFieldList } {
    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
        code: this.mapHttpStatusToErrorCode(status, defaultCode),
      };
    }
    if (typeof exceptionResponse !== 'object' || exceptionResponse === null) {
      return {
        message: exception.message || 'An error occurred',
        code: this.mapHttpStatusToErrorCode(status, defaultCode),
      };
    }
    const responseObj = exceptionResponse as HttpExceptionResponse;
    const { message, errors } = this.messageAndErrorsFromHttpBody(responseObj, exception);
    const code = responseObj.code || this.mapHttpStatusToErrorCode(status, defaultCode);
    if (responseObj.context?.field) {
      return {
        message,
        code,
        errors: [{ field: responseObj.context.field, code, message }],
      };
    }
    return { message, code, errors };
  }

  private extractErrorPayload(exception: unknown): ErrorPayload {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const parsed = this.parseHttpExceptionResponse(exception, status, 'INTERNAL_SERVER_ERROR');
      return {
        status,
        message: parsed.message,
        code: parsed.code,
        errors: parsed.errors,
      };
    }
    if (exception instanceof QueryFailedError) {
      this.logger.error(`Database error: ${exception.message}`, exception.stack);
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Database operation failed',
        code: 'DATABASE_ERROR',
      };
    }
    if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
    this.logger.error('Unhandled exception', exception);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  private buildErrorResponse(
    request: Request,
    traceContext: { traceId?: string; spanId?: string },
    payload: ErrorPayload,
  ): ErrorResponse {
    return {
      status: 'error',
      message: payload.message,
      code: payload.code,
      data: null,
      errors: payload.errors,
      meta: {
        requestId: getRequestId() || 'unknown',
        traceId: traceContext.traceId,
        spanId: traceContext.spanId,
        timestamp: new Date().toISOString(),
        path: request.url || request.path || '/',
        statusCode: payload.status,
      },
    };
  }

  private setTraceHeaders(response: Response, traceId?: string, spanId?: string): void {
    if (traceId) {
      response.setHeader('Trace-Id', traceId);
    }
    if (spanId) {
      response.setHeader('Span-Id', spanId);
    }
  }

  private recordMetricsAndSendJson(
    response: Response,
    request: Request,
    httpStatus: number,
    body: ErrorResponse,
  ): void {
    const route = request.route?.path || request.path || request.url.split('?')[0];
    const startMs = request.metricsStartTimeMs;
    const durationMs = typeof startMs === 'number' ? Date.now() - startMs : 0;
    this.observabilityService.recordHttpRequest(request.method, route, httpStatus, durationMs);
    response.status(httpStatus).json(body);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceContext = this.observabilityService.getTraceContext();
    const payload = this.extractErrorPayload(exception);
    const errorResponse = this.buildErrorResponse(request, traceContext, payload);
    this.setTraceHeaders(response, traceContext.traceId, traceContext.spanId);
    this.recordMetricsAndSendJson(response, request, payload.status, errorResponse);
  }

  private static readonly HTTP_STATUS_TO_ERROR_CODE: Readonly<Record<number, string>> = {
    [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.METHOD_NOT_ALLOWED]: 'METHOD_NOT_ALLOWED',
    [HttpStatus.CONFLICT]: 'CONFLICT',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
    [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    [HttpStatus.BAD_GATEWAY]: 'BAD_GATEWAY',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    [HttpStatus.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT',
  };

  private mapHttpStatusToErrorCode(status: number, defaultCode: string): string {
    return (
      GlobalExceptionFilter.HTTP_STATUS_TO_ERROR_CODE[status] || defaultCode || 'UNKNOWN_ERROR'
    );
  }
}
