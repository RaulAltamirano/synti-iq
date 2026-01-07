import { Inventory } from '../entities/inventory.entity';
import { InventoryStatus } from '../entities/inventory.entity';

export interface IInventoryRepository {
  findById(id: string): Promise<Inventory>;
  findByProductId(productId: string): Promise<Inventory>;
  save(inventory: Inventory): Promise<Inventory>;
  findByStatus(status: InventoryStatus): Promise<Inventory[]>;
  updateStock(productId: string, quantity: number): Promise<Inventory>;
  getLowStockProducts(threshold: number): Promise<Inventory[]>;
}
