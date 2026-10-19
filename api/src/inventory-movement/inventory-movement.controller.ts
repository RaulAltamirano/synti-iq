import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryMovementService } from './inventory-movement.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';

@Controller('inventory-movement')
export class InventoryMovementController {
  constructor(private readonly inventoryMovementService: InventoryMovementService) {}
}
