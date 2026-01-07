import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShiftSwapRequestService } from './shift-swap-request.service';
import { CreateShiftSwapRequestDto } from './dto/create-shift-swap-request.dto';
import { UpdateShiftSwapRequestDto } from './dto/update-shift-swap-request.dto';

@Controller('shift-swap-request')
export class ShiftSwapRequestController {
  constructor(private readonly shiftSwapRequestService: ShiftSwapRequestService) {}

  @Post()
  create(@Body() createShiftSwapRequestDto: CreateShiftSwapRequestDto) {
    return this.shiftSwapRequestService.create(createShiftSwapRequestDto);
  }

  @Get()
  findAll() {
    return this.shiftSwapRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftSwapRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftSwapRequestDto: UpdateShiftSwapRequestDto) {
    return this.shiftSwapRequestService.update(+id, updateShiftSwapRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftSwapRequestService.remove(+id);
  }
}
