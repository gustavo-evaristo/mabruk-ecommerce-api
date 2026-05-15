import { StockMovementEntity } from '../entities/stock-movement.entity';

export abstract class IStockMovementRepository {
  abstract create(movement: StockMovementEntity): Promise<void>;
  abstract listByVariantId(variantId: string): Promise<StockMovementEntity[]>;
}
