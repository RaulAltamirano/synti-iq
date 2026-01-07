import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ResourceNotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(`${resource} no encontrado${id ? ` con id: ${id}` : ''}`);
    this.name = 'ResourceNotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConcurrencyError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

@Injectable()
export class ErrorHandlingService {
  handleDomainError(error: Error): never {
    if (error instanceof ResourceNotFoundError) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }

    if (error instanceof ValidationError) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (error instanceof ConcurrencyError) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }

    if (error instanceof DomainError) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    console.error('Error no controlado:', error);
    throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async handleAsync<T>(func: () => Promise<T>): Promise<T> {
    try {
      return await func();
    } catch (error) {
      this.handleDomainError(error);
    }
  }
}
