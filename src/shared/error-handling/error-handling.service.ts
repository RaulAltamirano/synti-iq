import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { trace, SpanStatusCode } from '@opentelemetry/api';

export interface ErrorContext {
  field?: string;
  value?: unknown;
  resource?: string;
  id?: string;
  [key: string]: unknown;
}

export class DomainError extends Error {
  public readonly code: string;
  public readonly context?: ErrorContext;
  public readonly statusCode: HttpStatus;

  constructor(
    message: string,
    code: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    context?: ErrorContext,
  ) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(resource: string, id?: string, context?: ErrorContext): DomainError {
    return new DomainError(
      `${resource} not found${id ? ` with id: ${id}` : ''}`,
      'RESOURCE_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { ...context, resource, id },
    );
  }

  static validation(
    message: string,
    field?: string,
    value?: unknown,
    context?: ErrorContext,
  ): DomainError {
    return new DomainError(message, 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST, {
      ...context,
      field,
      value,
    });
  }

  static conflict(message: string, context?: ErrorContext): DomainError {
    return new DomainError(message, 'CONFLICT', HttpStatus.CONFLICT, context);
  }

  static businessRule(message: string, context?: ErrorContext): DomainError {
    return new DomainError(
      message,
      'BUSINESS_RULE_VIOLATION',
      HttpStatus.UNPROCESSABLE_ENTITY,
      context,
    );
  }
}

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);
  private readonly tracer = trace.getTracer('error-handling');

  private recordErrorInSpan(error: Error, errorCode: string, context?: ErrorContext): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.setAttribute('error.name', error.name);
      span.setAttribute('error.code', errorCode);
      if (context) {
        if (context.field) span.setAttribute('error.field', String(context.field));
        if (context.resource) span.setAttribute('error.resource', String(context.resource));
        if (context.id) span.setAttribute('error.resource_id', String(context.id));
      }
    }
  }

  handleDomainError(error: Error): never {
    if (error instanceof DomainError) {
      this.recordErrorInSpan(error, error.code, error.context);
      const httpException = this.mapToHttpException(error);
      throw httpException;
    }

    if (error instanceof HttpException) {
      const span = trace.getActiveSpan();
      if (span) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.setAttribute('error.name', 'HttpException');
        span.setAttribute('error.status_code', error.getStatus());
      }
      throw error;
    }

    this.recordErrorInSpan(error, 'INTERNAL_SERVER_ERROR');
    this.logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });

    throw new InternalServerErrorException({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  private mapToHttpException(error: DomainError): HttpException {
    const errorResponse = {
      message: error.message,
      code: error.code,
      context: error.context,
    };

    switch (error.statusCode) {
      case HttpStatus.NOT_FOUND:
        return new NotFoundException(errorResponse);
      case HttpStatus.BAD_REQUEST:
        return new BadRequestException(errorResponse);
      case HttpStatus.CONFLICT:
        return new ConflictException(errorResponse);
      default:
        return new HttpException(errorResponse, error.statusCode);
    }
  }

  async handleAsync<T>(func: () => Promise<T>): Promise<T> {
    try {
      return await func();
    } catch (error) {
      this.handleDomainError(error as Error);
    }
  }
}
