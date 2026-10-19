import { Controller } from '@nestjs/common';
import { ErrorHandlingService } from './error-handling.service';

@Controller('error-handling')
export class ErrorHandlingController {
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}
}
