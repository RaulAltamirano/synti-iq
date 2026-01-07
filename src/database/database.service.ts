import { Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import {
  DatabaseConflictException,
  InvalidDataException,
} from './exceptions/database-conflict.exception';

@Injectable()
export class DatabaseService {
  private logger = new Logger('DatabaseError');

  handlerDBexceptions(error: any): void {
    if (error.code === '23505') {
      this.logger.error('Duplicate entry found in the database.', error.detail);
      throw new DatabaseConflictException('Duplicate entry found in the database.', error.detail);
    }

    if (error.code === '22P02') {
      this.logger.error('Invalid data provided.', error.detail);
      throw new InvalidDataException('Invalid data provided.', error.detail);
    }

    this.logger.error('Unexpected error occurred.', error);
    throw new InternalServerErrorException(
      'An unexpected error occurred while processing the request. Please try again later or contact support.',
    );
  }
}
