import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TimeBlockTemplateService } from './time-block-template.service';
import { CreateTimeBlockTemplateDto } from './dto/create-time-block-template.dto';
import { UpdateTimeBlockTemplateDto } from './dto/update-time-block-template.dto';

@Controller('time-block-template')
export class TimeBlockTemplateController {
  constructor(private readonly timeBlockTemplateService: TimeBlockTemplateService) {}
}
