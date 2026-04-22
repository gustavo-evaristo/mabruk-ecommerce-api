import { InventoryEntity } from '../entities/inventory.entity';

export abstract class IInventoryRepository {
  abstract findByProductId(productId: string): Promise<InventoryEntity | null>;
  abstract upsert(inventory: InventoryEntity): Promise<void>;
  abstract updateQuantity(productId: string, quantity: number): Promise<void>;
}
