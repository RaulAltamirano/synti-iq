import { IsUUID, IsNumber, IsEnum, IsOptional, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from 'src/inventory-movement/entities/inventory-movement.entity';

export class CreateInventoryDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  @Type(() => Number)
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  unitPrice?: number;

  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @MaxLength(100)
  reference?: string;
}
