import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DefaultProfileService } from './default_profile.service';
import { CreateDefaultProfileDto } from './dto/create-default_profile.dto';
import { UpdateDefaultProfileDto } from './dto/update-default_profile.dto';

@Controller('default-profile')
export class DefaultProfileController {
  constructor(private readonly defaultProfileService: DefaultProfileService) {}

  @Post()
  create(@Body() createDefaultProfileDto: CreateDefaultProfileDto) {
    return this.defaultProfileService.create(createDefaultProfileDto);
  }

  @Get()
  findAll() {
    return this.defaultProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.defaultProfileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDefaultProfileDto: UpdateDefaultProfileDto) {
    return this.defaultProfileService.update(+id, updateDefaultProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.defaultProfileService.remove(+id);
  }
}
