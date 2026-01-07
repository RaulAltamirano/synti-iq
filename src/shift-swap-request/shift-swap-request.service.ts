import { Injectable } from '@nestjs/common';
import { CreateShiftSwapRequestDto } from './dto/create-shift-swap-request.dto';
import { UpdateShiftSwapRequestDto } from './dto/update-shift-swap-request.dto';

@Injectable()
export class ShiftSwapRequestService {
  create(createShiftSwapRequestDto: CreateShiftSwapRequestDto) {
    return 'This action adds a new shiftSwapRequest';
  }

  findAll() {
    return `This action returns all shiftSwapRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shiftSwapRequest`;
  }

  update(id: number, updateShiftSwapRequestDto: UpdateShiftSwapRequestDto) {
    return `This action updates a #${id} shiftSwapRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} shiftSwapRequest`;
  }
}
