import { BadRequestException } from '@nestjs/common';

export class DatabaseConflictException extends BadRequestException {
  constructor(message?: string, detail?: any) {
    super(message || 'Database conflict.', detail);
  }
}
export class InvalidDataException extends BadRequestException {
  constructor(message?: string, detail?: any) {
    super(message || 'Invalid Data.', detail);
  }
}
