import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator';
import { ApiDoc } from 'src/shared/decorators';
import { TemplateService } from './template.service';
import { CreateTemplateItemDto } from './dto/create-template-item.dto';
import { UpdateTemplateItemDto } from './dto/update-template-item.dto';
import { FilterTemplateItemDto } from './dto/filter-template-item.dto';
import { TemplateItemResponseDto } from './dto/template-item-response.dto';
import { TemplateItemPaginatedDto } from './dto/template-item-paginated.dto';
import { templateEndpoints } from 'src/docs/template.endpoints';

@ApiTags('Template')
@Controller('template-items')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiDoc(templateEndpoints, 'list')
  @Auth('', [])
  async list(@Query() filter: FilterTemplateItemDto): Promise<TemplateItemPaginatedDto> {
    return this.templateService.findAll(filter);
  }

  @Get(':id')
  @ApiDoc(templateEndpoints, 'findById')
  @Auth('', [])
  async findById(@Param('id') id: string): Promise<TemplateItemResponseDto | null> {
    return this.templateService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiDoc(templateEndpoints, 'create')
  @Auth('', [])
  async create(@Body() dto: CreateTemplateItemDto): Promise<TemplateItemResponseDto> {
    return this.templateService.create(dto);
  }

  @Patch(':id')
  @ApiDoc(templateEndpoints, 'update')
  @Auth('', [])
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateItemDto,
  ): Promise<TemplateItemResponseDto> {
    return this.templateService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDoc(templateEndpoints, 'delete')
  @Auth('', [])
  async delete(@Param('id') id: string): Promise<void> {
    return this.templateService.delete(id);
  }
}
