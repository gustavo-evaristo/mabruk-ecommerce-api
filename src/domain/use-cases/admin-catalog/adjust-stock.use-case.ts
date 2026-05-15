import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { IStockMovementRepository } from 'src/domain/repositories/stock-movement.repository';
import {
  StockMovementEntity,
  StockMovementReason,
} from 'src/domain/entities/stock-movement.entity';

interface Input {
  variantId: string;
  delta: number;
  reason: StockMovementReason;
  notes?: string;
  adminId: string;
}

@Injectable()
export class AdjustStockUseCase {
  constructor(
    private readonly variantRepository: IProductVariantRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(input: Input) {
    const v = await this.variantRepository.get(input.variantId);
    if (!v) throw new NotFoundException('Variant not found');

    v.applyStockDelta(input.delta);
    await this.variantRepository.update(v);
    await this.stockMovementRepository.create(
      new StockMovementEntity({
        variantId: input.variantId,
        delta: input.delta,
        reason: input.reason,
        referenceId: input.adminId,
        notes: input.notes,
      }),
    );
    return v;
  }
}
