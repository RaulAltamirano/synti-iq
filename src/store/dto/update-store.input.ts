import { PartialType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';
import { CreateStoreInput } from './create-store.input.ts';

export class UpdateStoreInput extends PartialType(CreateStoreInput) {
  @IsUUID()
  id: string;
}
