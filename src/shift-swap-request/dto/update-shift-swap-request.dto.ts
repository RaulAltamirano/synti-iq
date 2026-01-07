import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftSwapRequestDto } from './create-shift-swap-request.dto';

export class UpdateShiftSwapRequestDto extends PartialType(CreateShiftSwapRequestDto) {}
