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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = getRequestId();
    const { traceId, spanId } = this.observabilityService.getTraceContext();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let errors: Array<{ field?: string; code?: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.mapHttpStatusToErrorCode(status, code);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as HttpExceptionResponse;
        const responseMessage = responseObj.message;

        if (Array.isArray(responseMessage)) {
          errors = responseMessage.map((msg: string) => ({
            message: msg,
          }));
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        } else if (typeof responseMessage === 'string' && responseMessage) {
          message = responseMessage;
        } else {
          message = exception.message || 'An error occurred';
        }

        if (responseObj.code) {
          code = responseObj.code;
        } else {
          code = this.mapHttpStatusToErrorCode(status, code);
        }

        if (responseObj.context && responseObj.context.field) {
          errors = [
            {
              field: responseObj.context.field,
              code: code,
              message: message,
            },
          ];
        }
      } else {
        message = exception.message || 'An error occurred';
        code = this.mapHttpStatusToErrorCode(status, code);
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      code = 'DATABASE_ERROR';
      this.logger.error(`Database error: ${exception.message}`, exception.stack);
    } else if (exception instanceof Error) {
      message = exception.message || 'An unexpected error occurred';
      code = 'UNKNOWN_ERROR';
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      message = 'An unexpected error occurred';
      code = 'UNKNOWN_ERROR';
      this.logger.error('Unhandled exception', exception);
    }

    const errorResponse: ErrorResponse = {
      status: 'error',
      message,
      code,
      data: null,
      errors,
      meta: {
        requestId: requestId || 'unknown',
        traceId,
        spanId,
        timestamp: new Date().toISOString(),
        path: request.url || request.path || '/',
        statusCode: status,
      },
    };

    if (traceId) {
      response.setHeader('Trace-Id', traceId);
    }
    if (spanId) {
      response.setHeader('Span-Id', spanId);
    }

    const method = request.method;
    const route = request.route?.path || request.path || request.url.split('?')[0];
    this.observabilityService.recordHttpRequest(method, route, status, 0);

    response.status(status).json(errorResponse);
  }

  private mapHttpStatusToErrorCode(status: number, defaultCode: string): string {
    const statusCodeMap: Record<number, string> = {
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

    return statusCodeMap[status] || defaultCode || 'UNKNOWN_ERROR';
  }
}
