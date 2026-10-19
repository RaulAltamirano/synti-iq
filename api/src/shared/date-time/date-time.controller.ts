import { Controller } from '@nestjs/common';
import { DateTimeService } from './date-time.service';

@Controller('date-time')
export class DateTimeController {
  constructor(private readonly dateTimeService: DateTimeService) {}
}
