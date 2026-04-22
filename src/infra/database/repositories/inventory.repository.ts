import { Injectable } from '@nestjs/common';
import { IInventoryRepository } from '../../../domain/repositories/inventory.repository';
import { InventoryEntity } from '../../../domain/entities/inventory.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string): Promise<InventoryEntity | null> {
    const row = await this.prisma.db.inventory.findUnique({ where: { product_id: productId } });
    return row ? toEntity(row) : null;
  }

  async upsert(inventory: InventoryEntity): Promise<void> {
    const data = {
      product_id: inventory.productId,
      quantity: inventory.quantity,
      reserved_quantity: inventory.reservedQuantity,
      last_synced_at: inventory.lastSyncedAt,
    };

    await this.prisma.db.inventory.upsert({
      where: { product_id: inventory.productId },
      create: { id: inventory.id.toString(), ...data },
      update: data,
    });
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    await this.prisma.db.inventory.updateMany({
      where: { product_id: productId },
      data: { quantity, last_synced_at: new Date() },
    });
  }
}

function toEntity(row: any): InventoryEntity {
  return new InventoryEntity({
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    reservedQuantity: row.reserved_quantity,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
