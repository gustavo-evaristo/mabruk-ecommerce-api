import { PromotionEntity, PromotionType } from '../entities/promotion.entity';

export abstract class IPromotionRepository {
  abstract list(filters?: { type?: PromotionType }): Promise<PromotionEntity[]>;
  abstract get(id: string): Promise<PromotionEntity | null>;
  abstract findByCode(code: string): Promise<PromotionEntity | null>;
  abstract create(p: PromotionEntity): Promise<void>;
  abstract update(p: PromotionEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract incrementUses(id: string): Promise<void>;
}
