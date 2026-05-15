import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IStockMovementRepository } from 'src/domain/repositories/stock-movement.repository';
import {
  StockMovementEntity,
  StockMovementReason,
} from 'src/domain/entities/stock-movement.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class StockMovementRepository implements IStockMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): StockMovementEntity {
    return new StockMovementEntity({
      id: UUID.from(row.id),
      variantId: UUID.from(row.variantId),
      delta: row.delta,
      reason: row.reason as StockMovementReason,
      referenceId: row.referenceId,
      notes: row.notes,
      createdAt: row.createdAt,
    });
  }

  async create(m: StockMovementEntity): Promise<void> {
    await this.prisma.stock_movements.create({
      data: {
        id: m.id.toString(),
        variantId: m.variantId.toString(),
        delta: m.delta,
        reason: m.reason,
        referenceId: m.referenceId,
        notes: m.notes,
        createdAt: m.createdAt,
      },
    });
  }

  async listByVariantId(variantId: string): Promise<StockMovementEntity[]> {
    const rows = await this.prisma.stock_movements.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }
}
