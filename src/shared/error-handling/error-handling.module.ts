import { Module } from '@nestjs/common';
import { ErrorHandlingService } from './error-handling.service';
import { ErrorHandlingController } from './error-handling.controller';

@Module({
  controllers: [ErrorHandlingController],
  providers: [ErrorHandlingService],
  exports: [ErrorHandlingService],
})
export class ErrorHandlingModule {}
