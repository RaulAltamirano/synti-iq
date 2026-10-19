import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateInventoryMovementDto {
  @IsUUID()
  storeId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsEnum(['add', 'remove', 'set', 'transfer'])
  operation: 'add' | 'remove' | 'set' | 'transfer';

  @IsOptional()
  @IsUUID()
  sourceStoreId?: string;

  @IsOptional()
  @IsUUID()
  targetStoreId?: string;

  @IsString()
  userId: string;

  @IsNumber()
  previousQuantity: number;

  @IsNumber()
  newQuantity: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
