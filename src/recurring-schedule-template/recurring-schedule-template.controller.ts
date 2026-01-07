import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { CreateRecurringScheduleDto } from './dto/create-recurring-schedule.dto';
import { RecurringScheduleTemplateService } from './recurring-schedule-template.service';
import { CreateRecurringScheduleTemplateDto } from './dto/create-recurring-schedule-template.dto';
import { RecurringScheduleTemplate } from './entities/recurring-schedule-template.entity';

@Controller('recurring-schedule')
export class RecurringScheduleTemplateController {
  constructor(private readonly recurringScheduleService: RecurringScheduleTemplateService) {}

  @Post()
  async create(
    @Body() createDto: CreateRecurringScheduleTemplateDto,
  ): Promise<RecurringScheduleTemplate> {
    return this.recurringScheduleService.createTemplate(createDto);
  }
}
