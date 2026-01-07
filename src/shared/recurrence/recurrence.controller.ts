import { Controller } from '@nestjs/common';
import { RecurrenceService } from './recurrence.service';

@Controller('recurrence')
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}
}
